from os import environ
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL') or 'your-full-render-db-url-here'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY')
    GOOGLE_CLIENT_ID = environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = environ.get('GOOGLE_CLIENT_SECRET')
    
    # Email configuration for Gmail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = environ.get('MAIL_USERNAME')  # Your Gmail address
    MAIL_PASSWORD = environ.get('MAIL_PASSWORD')  # Gmail App Password
    MAIL_DEFAULT_SENDER = environ.get('MAIL_USERNAME')  # Default sender email