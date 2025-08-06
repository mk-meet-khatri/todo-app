import React from "react";
import TodoList from "./TodoList";
import Logout from "./Logout";

function Dashboard({ token, onLogout }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Todo Dashboard</h1>
        <TodoList token={token} />
        <Logout onLogout={onLogout} />
      </div>
    </div>
  );
}

export default Dashboard;
