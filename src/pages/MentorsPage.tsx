import React, { useState, useEffect, useMemo } from 'react';
import { MentorProfile, Category } from '../types';
import { apiService } from '../services/api';
import '../styles/MentorsPage.css';

const MentorsPage: React.FC = () => {
  console.log('👥 MentorsPage component rendering...');
  
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'followers'>('popular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCategories() {
    try {
      setError(null);
      const response = await apiService.getCategories();
      if (response.error) throw new Error(response.error);
      const data = response.data || [];
      const arr: Category[] = Array.isArray(data) ? data : [];
      setCategories(arr.filter((c: Category) => (c as any).type === 'mentor' || (c as any).type === 'both'));
    } catch (e: any) {
      setError(e.message);
      setCategories([]);
    }
  }

  async function fetchMentors() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMentors();
      if (response.error) throw new Error(response.error);
      const data = response.data || [];
      const arr: MentorProfile[] = Array.isArray(data) ? data : [];
      setMentors(arr);
    } catch (e: any) {
      setError(e.message);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, sortBy]);

  const filteredMentors = useMemo(() => {
    let arr = mentors;
    if (selectedCategory !== 'all') {
      arr = arr.filter((m) => (m as any).profession === selectedCategory);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      arr = arr.filter((m) =>
        (m.profession || '').toLowerCase().includes(q) ||
        (m.specialization || '').toLowerCase().includes(q) ||
        (m.bio || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [mentors, selectedCategory, searchTerm]);

  const [newMentor, setNewMentor] = useState({ profession: '', specialization: '', bio: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMentor, setEditingMentor] = useState<MentorProfile | null>(null);
  const [editMentor, setEditMentor] = useState({ profession: '', specialization: '', bio: '' });
  async function createMentor() {
    console.log('👥 Creating mentor with data:', newMentor);
    try {
      const response = await apiService.createMentor(newMentor);
      console.log('👥 Create mentor response:', response);
      
      if (response.error) {
        console.error('❌ Create mentor failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Mentor created successfully');
      setNewMentor({ profession: '', specialization: '', bio: '' });
      setShowAddModal(false);
      setError(null);
      await fetchMentors();
    } catch (error) {
      console.error('❌ Create mentor error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create mentor');
    }
  }

  const sortedMentors = [...filteredMentors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      case 'followers':
        return (b.total_followers || 0) - (a.total_followers || 0);
      default:
        return (b.total_followers || 0) - (a.total_followers || 0);
    }
  });

  async function followMentor(id: string) {
    console.log(`👥 Following mentor ${id}`);
    try {
      const response = await apiService.followMentor(id);
      console.log('👥 Follow mentor response:', response);
      
      if (response.error) {
        console.error('❌ Follow mentor failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Mentor followed successfully');
      setMentors(prev => prev.map(m => m._id === id ? { ...m, total_followers: ((m.total_followers || 0) + 1) } : m));
      setError(null);
    } catch (error) {
      console.error('❌ Follow mentor error:', error);
      setError(error instanceof Error ? error.message : 'Failed to follow mentor');
    }
  }

  async function editMentor() {
    if (!editingMentor) return;
    
    console.log('📝 Editing mentor with data:', editMentor);
    try {
      const response = await apiService.updateMentor(editingMentor._id, editMentor);
      console.log('📝 Edit mentor response:', response);
      
      if (response.error) {
        console.error('❌ Edit mentor failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Mentor edited successfully');
      setEditMentor({ profession: '', specialization: '', bio: '' });
      setEditingMentor(null);
      setShowEditModal(false);
      setError(null);
      await fetchMentors();
    } catch (error) {
      console.error('❌ Edit mentor error:', error);
      setError(error instanceof Error ? error.message : 'Failed to edit mentor');
    }
  }

  async function deleteMentor(mentorId: string) {
    console.log('🗑️ Deleting mentor:', mentorId);
    if (!confirm('Are you sure you want to delete this mentor?')) return;
    
    try {
      const response = await apiService.deleteMentor(mentorId);
      console.log('🗑️ Delete mentor response:', response);
      
      if (response.error) {
        console.error('❌ Delete mentor failed:', response.error);
        setError(response.error);
        return;
      }
      
      console.log('✅ Mentor deleted successfully');
      setError(null);
      await fetchMentors();
    } catch (error) {
      console.error('❌ Delete mentor error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete mentor');
    }
  }

  function openEditModal(mentor: MentorProfile) {
    setEditingMentor(mentor);
    setEditMentor({
      profession: mentor.profession,
      specialization: mentor.specialization,
      bio: mentor.bio
    });
    setShowEditModal(true);
  }

  return (
    <div className="mentors-page">
      <div className="mentors-header">
        <h1>Explore Mentors</h1>
        <div className="mentors-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Mentors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filters">
            <select className="filter-btn" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">All Professions</option>
              {categories.map(c => (
                <option key={(c as any)._id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <button className="filter-btn" onClick={() => setSortBy(sortBy === 'popular' ? 'rating' : sortBy === 'rating' ? 'followers' : 'popular')}>
              <span className="filter-icon">☰</span>
              Sort By : {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </button>
          </div>
        </div>
      </div>

      {loading && <div>Loading mentors...</div>}
      {error && <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px 0', backgroundColor: '#ffe6e6', border: '1px solid #ff9999', borderRadius: '4px' }}>Error: {error}</div>}

      <div className="page-actions" style={{ margin: '12px 0' }}>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>+ Add Mentor</button>
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.currentTarget === e.target) setShowAddModal(false); }}>
          <div className="modal-card">
            <h3>Create Mentor</h3>
            <div className="form-field">
              <label htmlFor="mentor-profession">Profession</label>
              <input id="mentor-profession" placeholder="Profession" value={newMentor.profession} onChange={e => setNewMentor({ ...newMentor, profession: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="mentor-spec">Specialization</label>
              <input id="mentor-spec" placeholder="Specialization" value={newMentor.specialization} onChange={e => setNewMentor({ ...newMentor, specialization: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="mentor-bio">Bio</label>
              <input id="mentor-bio" placeholder="Brief bio" value={newMentor.bio} onChange={e => setNewMentor({ ...newMentor, bio: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="primary-btn" disabled={!newMentor.profession} onClick={createMentor}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingMentor && (
        <div className="modal-backdrop" onClick={(e) => { if (e.currentTarget === e.target) setShowEditModal(false); }}>
          <div className="modal-card">
            <h3>Edit Mentor</h3>
            <div className="form-field">
              <label htmlFor="edit-mentor-profession">Profession</label>
              <input id="edit-mentor-profession" placeholder="Profession" value={editMentor.profession} onChange={e => setEditMentor({ ...editMentor, profession: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="edit-mentor-spec">Specialization</label>
              <input id="edit-mentor-spec" placeholder="Specialization" value={editMentor.specialization} onChange={e => setEditMentor({ ...editMentor, specialization: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="edit-mentor-bio">Bio</label>
              <input id="edit-mentor-bio" placeholder="Brief bio" value={editMentor.bio} onChange={e => setEditMentor({ ...editMentor, bio: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="primary-btn" disabled={!editMentor.profession} onClick={editMentor}>Update</button>
            </div>
          </div>
        </div>
      )}

      <div className="mentors-grid">
        {sortedMentors.map((mentor) => (
          <div key={mentor._id} className="mentor-card">
            <div className="mentor-header">
              <div className="mentor-avatar">👤</div>
              <div className="mentor-info">
                <h3 className="mentor-name">{mentor.profession}</h3>
                <p className="mentor-profession">{mentor.specialization}</p>
              </div>
              <div className="mentor-actions" style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                <button className="follow-btn" onClick={() => followMentor(mentor._id)}>+ Follow</button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    className="edit-btn" 
                    onClick={() => openEditModal(mentor)}
                    style={{ 
                      background: '#3B82F6', 
                      color: 'white', 
                      border: 'none', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => deleteMentor(mentor._id)}
                    style={{ 
                      background: '#EF4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <p className="mentor-bio">{mentor.bio}</p>
            <div className="mentor-stats">
              <div className="stat">
                <span className="stat-icon">📋</span>
                <span>{mentor.total_tasks_completed} Task</span>
              </div>
              <div className="stat">
                <span className="stat-icon">⭐</span>
                <span>{mentor.average_rating} ({mentor.total_reviews} Reviews)</span>
              </div>
              <div className="stat">
                <span className="stat-icon">👥</span>
                <span>{mentor.total_followers} Followers</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-mentors">
        <h2>Recent Mentors</h2>
        <div className="mentors-scroll">
          {sortedMentors.map((mentor) => (
            <div key={mentor._id} className="mentor-scroll-card">
              <div className="mentor-avatar">👤</div>
              <div className="mentor-info">
                <h4>{mentor.profession}</h4>
                <p>{mentor.specialization}</p>
              </div>
              <button className="follow-btn" onClick={() => followMentor(mentor._id)}>+ Follow</button>
              <div className="mentor-stats">
                <span>{mentor.total_tasks_completed} Task</span>
                <span>⭐ {mentor.average_rating} ({mentor.total_reviews})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorsPage;
