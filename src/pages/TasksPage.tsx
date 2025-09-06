import React, { useState, useEffect } from 'react';
import { Task, Category } from '../types';
import { apiService } from '../services/api';
import '../styles/TasksPage.css';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'progress'>('deadline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: '', priority: 'medium', deadline: '' });

  async function fetchCategories() {
    try {
      const response = await apiService.getCategories();
      if (response.error) throw new Error(response.error);
      const data = response.data || [];
      const arr: Category[] = Array.isArray(data) ? data : [];
      setCategories(arr.filter((c: Category) => (c as any).type === 'task' || (c as any).type === 'both'));
    } catch (e: any) {
      setError(e.message);
      setCategories([]);
    }
  }

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTasks();
      if (response.error) throw new Error(response.error);
      const data = response.data || [];
      const arr: Task[] = Array.isArray(data) ? data : [];
      setTasks(arr);
    } catch (e: any) {
      setError(e.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, sortBy]);

  const filteredTasks = tasks;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const order: any = { urgent: 4, high: 3, medium: 2, low: 1 };
        return order[(b as any).priority] - order[(a as any).priority];
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      default:
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
  });

  const getDaysLeft = (deadline: Date) => {
    const today = new Date();
    const diffTime = new Date(deadline).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days Left` : 'Overdue';
  };

  async function updateProgress(taskId: string, progress: number) {
    try {
      const response = await apiService.updateTaskProgress(taskId, progress);
      if (!response.error) {
        setTasks(prev => prev.map(t => (t as any)._id === taskId ? { ...t, progress } as Task : t));
      }
    } catch {}
  }

  async function createTask() {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      setNewTask({ title: '', description: '', category: '', priority: 'medium', deadline: '' });
      setShowAddModal(false);
      fetchTasks();
    } catch {}
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Explore Task</h1>
        <div className="tasks-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Task"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filters">
            <select className="filter-btn" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={(c as any)._id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button className="filter-btn" onClick={() => setSortBy(sortBy === 'deadline' ? 'priority' : sortBy === 'priority' ? 'progress' : 'deadline')}>
              <span className="filter-icon">☰</span>
              Sort By : {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </button>
          </div>
        </div>
      </div>

      <div className="page-actions">
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>+ Add Task</button>
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.currentTarget === e.target) setShowAddModal(false); }}>
          <div className="modal-card">
            <h3>Create Task</h3>
            <div className="form-field">
              <label htmlFor="task-title">Title</label>
              <input id="task-title" placeholder="Task title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="task-desc">Description</label>
              <input id="task-desc" placeholder="Short description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="task-cat">Category</label>
                <select id="task-cat" value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={(c as any)._id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="task-priority">Priority</label>
                <select id="task-priority" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="urgent">urgent</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="task-deadline">Deadline</label>
              <input id="task-deadline" type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary-btn" disabled={!newTask.title || !newTask.description} onClick={createTask}>Create</button>
            </div>
          </div>
        </div>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Loading tasks...</div>}

      <div className="tasks-grid">
        {sortedTasks.map((task) => (
          <div key={(task as any)._id} className="task-card">
            <div className="task-image">
              <div className="task-thumbnail">💻</div>
            </div>
            <div className="task-content">
              <h3 className="task-title">{task.title}</h3>
              <p className="task-category">{task.category}</p>

              <div className="task-progress">
                <span className="progress-label">Progress</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${task.progress || 0}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">{task.progress || 0}%</span>
                <input type="range" min={0} max={100} value={task.progress || 0} onChange={(e) => updateProgress((task as any)._id as any, Number(e.target.value))} />
              </div>

              <div className="task-deadline">
                <span className="deadline-icon">⏰</span>
                <span className="deadline-text">{getDaysLeft(task.deadline)}</span>
              </div>

              <div className="task-assignees">
                {(task.assigned_to || []).map((userId, index) => (
                  <div key={index} className="assignee-avatar">👤</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="time-limit-section">
        <h2>Time Limit</h2>
        <div className="time-tasks-scroll">
          {sortedTasks.map((task) => (
            <div key={(task as any)._id} className="time-task-card">
              <div className="time-task-image">
                <div className="time-task-thumbnail">📱</div>
              </div>
              <div className="time-task-content">
                <h4 className="time-task-title">{task.title}</h4>
                <p className="time-task-category">{task.category}</p>

                <div className="time-task-progress">
                  <span className="progress-label">Progress</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{task.progress || 0}%</span>
                </div>

                <div className="time-task-estimate">
                  <span className="estimate-icon">⏰</span>
                  <span className="estimate-text">{task.estimated_time?.hours ?? 0} Hour</span>
                </div>

                <div className="time-task-assignees">
                  {(task.assigned_to || []).map((userId, index) => (
                    <div key={index} className="assignee-avatar">👤</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
