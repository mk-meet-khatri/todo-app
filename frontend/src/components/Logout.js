import React from "react";

function Logout({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      className="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}

export default Logout;
