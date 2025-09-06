import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

const TodoApp = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [currentView, setCurrentView] = useState('all');
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [taskForm, setTaskForm] = useState({ title: '', dueDate: '', priority: 'MEDIUM' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username, token });
      fetchTasks(token);
    }
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, currentView]);

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const fetchTasks = async (token = user?.token) => {
    if (!token) return;
    
    setLoading(true);
    try {
      setAuthToken(token);
      const response = await axios.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  const filterTasks = () => {
    if (currentView === 'completed') {
      setFilteredTasks(tasks.filter(task => task.completed));
    } else if (currentView === 'pending') {
      setFilteredTasks(tasks.filter(task => !task.completed));
    } else {
      setFilteredTasks(tasks);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/auth/login', loginForm);
      const { token, username } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      setUser({ username, token });
      setAuthToken(token);
      await fetchTasks(token);
      setLoginForm({ username: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/auth/register', registerForm);
      const { token, username } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      setUser({ username, token });
      setAuthToken(token);
      await fetchTasks(token);
      setRegisterForm({ username: '', email: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setTasks([]);
    setAuthToken(null);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    
    setLoading(true);
    try {
      const taskData = {
        title: taskForm.title,
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority,
        completed: false
      };
      
      await axios.post('/tasks', taskData);
      setTaskForm({ title: '', dueDate: '', priority: 'MEDIUM' });
      await fetchTasks();
    } catch (error) {
      alert('Error adding task');
    }
    setLoading(false);
  };

  const handleUpdateTask = async (id, updatedData) => {
    setLoading(true);
    try {
      await axios.put(`/tasks/${id}`, updatedData);
      await fetchTasks();
    } catch (error) {
      alert('Error updating task');
    }
    setLoading(false);
  };

  const handleCompleteTask = async (id) => {
    setLoading(true);
    try {
      await axios.put(`/tasks/${id}/complete`);
      await fetchTasks();
    } catch (error) {
      alert('Error completing task');
    }
    setLoading(false);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`/tasks/${id}`);
      await fetchTasks();
    } catch (error) {
      alert('Error deleting task');
    }
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📝 Todo Manager</h1>
            <p className="text-gray-600">Welcome! Please login or register to continue.</p>
          </div>

          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  showLogin
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !showLogin
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {showLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">📝 Todo Manager</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Task Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
              </form>
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg">
              {/* Filter Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {[
                    { key: 'all', label: 'All Tasks', count: tasks.length },
                    { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
                    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setCurrentView(key)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        currentView === key
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="p-6">
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading tasks...</p>
                  </div>
                )}

                {!loading && filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600">
                      {currentView === 'all' ? 'Start by adding your first task!' : 
                       currentView === 'completed' ? 'No completed tasks yet.' : 
                       'No pending tasks. Great job!'}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onComplete, onUpdate, onDelete, getPriorityColor, formatDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    dueDate: task.dueDate || '',
    priority: task.priority
  });

  const handleSaveEdit = () => {
    onUpdate(task.id, editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      title: task.title,
      dueDate: task.dueDate || '',
      priority: task.priority
    });
    setIsEditing(false);
  };

  return (
    <div className={`border rounded-lg p-4 transition-all hover:shadow-md ${
      task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
    }`}>
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-3">
            <input
              type="date"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Due: {formatDate(task.dueDate)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!task.completed && (
              <>
                <button
                  onClick={() => onComplete(task.id)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors"
                >
                  ✓ Complete
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  ✏️ Edit
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;