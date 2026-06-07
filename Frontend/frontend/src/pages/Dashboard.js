import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTasks();
  }, [user, navigate]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/tasks', formData);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${task._id}/toggle`);
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description });
    setShowModal(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || task.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">Task Manager</div>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="stats-container">
          <div className="stat-card">Total Tasks: {stats.total}</div>
          <div className="stat-card completed">Completed: {stats.completed}</div>
          <div className="stat-card pending">Pending: {stats.pending}</div>
        </div>

        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button className="add-task-btn" onClick={() => {
            setEditingTask(null);
            setFormData({ title: '', description: '' });
            setShowModal(true);
          }}>
            + Add Task
          </button>
        </div>

        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">No tasks found</div>
          ) : (
            filteredTasks.map(task => (
              <div key={task._id} className={`task-card ${task.status}`}>
                <div className="task-content">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <div className="task-actions">
                      <button onClick={() => handleToggleStatus(task)} className="toggle-btn">
                        {task.status === 'pending' ? '✓ Complete' : '↺ Undo'}
                      </button>
                      <button onClick={() => handleEdit(task)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDelete(task._id)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span className={`status-badge ${task.status}`}>{task.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit">{editingTask ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;