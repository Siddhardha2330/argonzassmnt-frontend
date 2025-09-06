import React, { useState, useEffect } from 'react';
import { Task, Category } from '../types';
import { apiService } from '../services/api';
import '../styles/TasksPage.css';

const TasksPage: React.FC = () => {
  console.log('📋 TasksPage component rendering...');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'progress'>('deadline');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: '', priority: 'medium', deadline: '' });
  const [editTaskData, setEditTaskData] = useState({ title: '', description: '', category: '', priority: 'medium', deadline: '' });

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
    fetchTasks();
  }, []);

  // Simple filtering logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
                         task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const diffTime = new Date(deadline).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days Left` : 'Overdue';
  };

  async function updateProgress(taskId: string, progress: number) {
    console.log(`📋 Updating task ${taskId} progress to ${progress}%`);
    try {
      const response = await apiService.updateTaskProgress(taskId, progress);
      console.log('📋 Update progress response:', response);
      
      if (response.error) {
        console.error('❌ Update progress failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Task progress updated successfully');
      setTasks(prev => prev.map(t => (t as any)._id === taskId ? { ...t, progress } as Task : t));
      setError(null);
    } catch (error) {
      console.error('❌ Update progress error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update progress');
    }
  }

  async function createTask() {
    console.log('📋 Creating task with data:', newTask);
    try {
      const response = await apiService.createTask(newTask);
      console.log('📋 Create task response:', response);
      
      if (response.error) {
        console.error('❌ Create task failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Task created successfully');
      setNewTask({ title: '', description: '', category: '', priority: 'medium', deadline: '' });
      setShowAddModal(false);
      setError(null);
      await fetchTasks();
    } catch (error) {
      console.error('❌ Create task error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
    }
  }

  async function updateTask() {
    if (!editingTask) return;
    
    console.log('📝 Editing task with data:', editTaskData);
    try {
      const response = await apiService.updateTask(editingTask._id, editTaskData);
      console.log('📝 Edit task response:', response);
      
      if (response.error) {
        console.error('❌ Edit task failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Task edited successfully');
      setEditTaskData({ title: '', description: '', category: '', priority: 'medium', deadline: '' });
      setEditingTask(null);
      setShowEditModal(false);
      setError(null);
      await fetchTasks();
    } catch (error) {
      console.error('❌ Edit task error:', error);
      setError(error instanceof Error ? error.message : 'Failed to edit task');
    }
  }

  async function deleteTask(taskId: string) {
    console.log('🗑️ Deleting task:', taskId);
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await apiService.deleteTask(taskId);
      console.log('🗑️ Delete task response:', response);
      
      if (response.error) {
        console.error('❌ Delete task failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Task deleted successfully');
      setError(null);
      await fetchTasks();
    } catch (error) {
      console.error('❌ Delete task error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    }
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setEditTaskData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: (task as any).priority || 'medium',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Explore Task</h1>
        <div className="tasks-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search tasks..."
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

      {showEditModal && editingTask && (
        <div className="modal-backdrop" onClick={(e) => { if (e.currentTarget === e.target) setShowEditModal(false); }}>
          <div className="modal-card">
            <h3>Edit Task</h3>
            <div className="form-field">
              <label htmlFor="edit-task-title">Title</label>
              <input id="edit-task-title" placeholder="Task title" value={editTaskData.title} onChange={e => setEditTaskData({ ...editTaskData, title: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="edit-task-desc">Description</label>
              <input id="edit-task-desc" placeholder="Short description" value={editTaskData.description} onChange={e => setEditTaskData({ ...editTaskData, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="edit-task-cat">Category</label>
                <select id="edit-task-cat" value={editTaskData.category} onChange={e => setEditTaskData({ ...editTaskData, category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={(c as any)._id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="edit-task-priority">Priority</label>
                <select id="edit-task-priority" value={editTaskData.priority} onChange={e => setEditTaskData({ ...editTaskData, priority: e.target.value })}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="edit-task-deadline">Deadline</label>
              <input id="edit-task-deadline" type="date" value={editTaskData.deadline} onChange={e => setEditTaskData({ ...editTaskData, deadline: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="primary-btn" disabled={!editTaskData.title || !editTaskData.description} onClick={updateTask}>Update</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div>Loading tasks...</div>}
      {error && <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px 0', backgroundColor: '#ffe6e6', border: '1px solid #ff9999', borderRadius: '4px' }}>Error: {error}</div>}

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
                <input 
                  type="range" 
                  min={0} 
                  max={100} 
                  value={task.progress || 0} 
                  onChange={(e) => {
                    const newProgress = Number(e.target.value);
                    setTasks(prev => prev.map(t => (t as any)._id === (task as any)._id ? { ...t, progress: newProgress } as Task : t));
                    // Debounced API call
                    setTimeout(() => {
                      updateProgress((task as any)._id, newProgress);
                    }, 1000);
                  }} 
                />
              </div>

              <div className="task-deadline">
                <span className="deadline-icon">⏰</span>
                <span className="deadline-text">{getDaysLeft(task.deadline ? task.deadline.toString() : new Date().toISOString())}</span>
              </div>

              <div className="task-assignees">
                {(task.assigned_to || []).map((userId, index) => (
                  <div key={index} className="assignee-avatar">👤</div>
                ))}
              </div>

              <div className="task-actions">
                <button 
                  className="edit-btn" 
                  onClick={() => openEditModal(task)}
                  style={{ 
                    background: '#3B82F6', 
                    color: 'white', 
                    border: 'none', 
                    padding: '6px 12px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginRight: '8px'
                  }}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => deleteTask((task as any)._id)}
                  style={{ 
                    background: '#EF4444', 
                    color: 'white', 
                    border: 'none', 
                    padding: '6px 12px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;