import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Todo App
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Organize your tasks efficiently with our Todo App! Create, manage, and
          track your daily tasks with ease. Sign up to start building your
          personalized todo list or log in to access your existing tasks.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
