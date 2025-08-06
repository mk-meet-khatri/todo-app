from flask import Flask, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail, Message
from config import Config
from models import db, User, Todo
from werkzeug.security import generate_password_hash, check_password_hash
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests
import os

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Initialize Flask-Mail
mail = Mail(app)

# with app.app_context():
#     db.create_all()
@app.before_first_request
def create_tables():
    db.create_all()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'User already exists'}), 400
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token}), 200

@app.route('/auth/google', methods=['GET'])
def google_login():
    redirect_uri = url_for('google_callback', _external=True)
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={app.config['GOOGLE_CLIENT_ID']}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"prompt=select_account"
    )
    print(f"Redirecting to Google OAuth: {google_auth_url}")  # Debug
    return redirect(google_auth_url)

@app.route('/auth/google/callback', methods=['GET'])
def google_callback():
    code = request.args.get('code')
    print(f"Received code: {code}")  # Debug
    if not code:
        print("No authorization code received")  # Debug
        return jsonify({'message': 'Authorization code missing'}), 400

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        'code': code,
        'client_id': app.config['GOOGLE_CLIENT_ID'],
        'client_secret': app.config['GOOGLE_CLIENT_SECRET'],
        'redirect_uri': url_for('google_callback', _external=True),
        'grant_type': 'authorization_code'
    }
    print(f"Exchanging code for token: {token_data}")  # Debug
    token_response = requests.post(token_url, data=token_data)
    token_json = token_response.json()
    print(f"Token response: {token_json}")  # Debug

    if 'id_token' not in token_json:
        print("No id_token in response")  # Debug
        return jsonify({'message': 'Failed to retrieve ID token'}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token_json['id_token'],
            google_requests.Request(),
            app.config['GOOGLE_CLIENT_ID']
        )
        google_id = idinfo['sub']
        email = idinfo['email']
        print(f"Verified token: google_id={google_id}, email={email}")  # Debug

        user = User.query.filter_by(google_id=google_id).first()
        if not user:
            user = User.query.filter_by(username=email).first()
            if not user:
                user = User(username=email, google_id=google_id)
                db.session.add(user)
                db.session.commit()
                print(f"Created new user: {email}")  # Debug
            else:
                user.google_id = google_id
                db.session.commit()
                print(f"Updated user with google_id: {email}")  # Debug

        access_token = create_access_token(identity=str(user.id))
        frontend_url = f"http://localhost:3000/login?token={access_token}"
        print(f"Redirecting to frontend: {frontend_url}")  # Debug
        return redirect(frontend_url)
    except ValueError as e:
        print(f"Token verification failed: {str(e)}")  # Debug
        return jsonify({'message': 'Invalid token'}), 400

@app.route('/todos', methods=['GET'])
@jwt_required()
def get_todos():
    user_id = int(get_jwt_identity())
    todos = Todo.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': todo.id, 'task': todo.task} for todo in todos]), 200

@app.route('/todos', methods=['POST'])
@jwt_required()
def add_todo():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    task = data.get('task')
    if not task:
        return jsonify({'message': 'Task cannot be empty'}), 400
    new_todo = Todo(task=task, user_id=user_id)
    db.session.add(new_todo)
    db.session.commit()

    # Send email notification
    user = User.query.get(user_id)
    email_status = "Email notification sent successfully!"
    if user and user.username:  # Assuming username is the email for Google SSO users
        try:
            msg = Message(
                subject='New Todo Created',
                recipients=[user.username],
                body=f'Hello,\n\nA new todo has been created: "{task}".\n\nBest regards,\nYour Todo App'
            )
            mail.send(msg)
            print(f"Email sent to {user.username} for new todo: {task}")
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            email_status = "Failed to send email notification"

    return jsonify({
        'id': new_todo.id,
        'task': new_todo.task,
        'email_status': email_status
    }), 201

@app.route('/todos/<int:id>', methods=['PUT'])
@jwt_required()
def update_todo(id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    task = data.get('task')
    if not task:
        return jsonify({'message': 'Task cannot be empty'}), 400
    todo = Todo.query.filter_by(id=id, user_id=user_id).first()
    if not todo:
        return jsonify({'message': 'Todo not found'}), 404
    todo.task = task
    db.session.commit()
    return jsonify({'id': todo.id, 'task': todo.task}), 200

@app.route('/todos/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_todo(id):
    user_id = int(get_jwt_identity())
    todo = Todo.query.filter_by(id=id, user_id=user_id).first()
    if not todo:
        return jsonify({'message': 'Todo not found'}), 404
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Todo deleted'}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)