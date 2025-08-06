import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TodoList({ token }) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("No authentication token. Please log in again.");
      navigate("/");
      return;
    }
    fetchTodos();
  }, [token, navigate]);

  const fetchTodos = async () => {
    try {
      console.log("Fetching todos with token:", token);
      const response = await fetch("http://localhost:5000/todos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("GET /todos status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("GET /todos data:", data);
        setTodos(data.sort((a, b) => b.id - a.id));
        setError("");
      } else {
        const data = await response.json();
        setError(
          data.message || `Failed to fetch todos (Status: ${response.status})`
        );
        if (response.status === 401 || response.status === 422) {
          setError("Invalid or missing token. Please log in again.");
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
      console.error("Error fetching todos:", err);
      navigate("/");
    }
  };

  const handleAddTask = async () => {
    if (!token) {
      setError("No authentication token. Please log in again.");
      navigate("/");
      return;
    }
    if (!newTask.trim()) {
      setError("Task cannot be empty");
      return;
    }
    setLoading(true); // Set loading to true
    try {
      console.log("Adding task:", newTask, "with token:", token);
      const response = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task: newTask }),
      });
      const newTodo = await response.json();
      console.log("POST /todos response:", newTodo);
      if (response.ok) {
        setTodos([newTodo, ...todos]);
        setNewTask("");
        setError("");
        setSuccess(`Task added successfully! ${newTodo.email_status}`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(
          newTodo.message || `Failed to add task (Status: ${response.status})`
        );
        if (response.status === 401 || response.status === 422) {
          setError("Invalid or missing token. Please log in again.");
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
      console.error("Error adding todo:", err);
      navigate("/");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleEditTask = (todo) => {
    setEditingTask(todo.id);
    setEditText(todo.task);
    setError("");
    setSuccess("");
  };

  const handleUpdateTask = async (id) => {
    if (!token) {
      setError("No authentication token. Please log in again.");
      navigate("/");
      return;
    }
    if (!editText.trim()) {
      setError("Task cannot be empty");
      return;
    }
    setLoading(true); // Set loading to true for update
    try {
      console.log("Updating task:", id, "to:", editText);
      const response = await fetch(`http://localhost:5000/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ task: editText }),
      });
      const updatedTodo = await response.json();
      console.log("PUT /todos response:", updatedTodo);
      if (response.ok) {
        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
        setEditingTask(null);
        setEditText("");
        setError("");
        setSuccess("Task updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(
          updatedTodo.message ||
            `Failed to update task (Status: ${response.status})`
        );
        if (response.status === 401 || response.status === 422) {
          setError("Invalid or missing token. Please log in again.");
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    } catch (err) {
      setError("Network error");
      console.error("Error updating todo:", err);
      navigate("/");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleDeleteTask = async (id) => {
    if (!token) {
      setError("No authentication token. Please log in again.");
      navigate("/");
      return;
    }
    setLoading(true); // Set loading to true for delete
    try {
      console.log("Deleting task:", id);
      const response = await fetch(`http://localhost:5000/todos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("DELETE /todos response:", data);
      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id));
        setError("");
        setSuccess("Task deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(
          data.message || `Failed to delete task (Status: ${response.status})`
        );
        if (response.status === 401 || response.status === 422) {
          setError("Invalid or missing token. Please log in again.");
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    } catch (err) {
      setError("Network error");
      console.error("Error deleting todo:", err);
      navigate("/");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading} // Disable input during loading
        />
        <button
          onClick={handleAddTask}
          className={`w-full mt-2 p-2 rounded transition flex items-center justify-center ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding...
            </>
          ) : (
            "Add Task"
          )}
        </button>
      </div>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center p-2 border-b">
            {editingTask === todo.id ? (
              <div className="flex w-full items-center">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading} // Disable input during loading
                />
                <button
                  onClick={() => handleUpdateTask(todo.id)}
                  className={`ml-2 px-3 py-1 rounded transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className={`ml-2 px-3 py-1 rounded transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  }`}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-between items-center">
                <span>{todo.task}</span>
                <div>
                  <button
                    onClick={() => handleEditTask(todo)}
                    className={`text-blue-500 hover:text-blue-700 mr-2 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(todo.id)}
                    className={`text-red-500 hover:text-red-700 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
