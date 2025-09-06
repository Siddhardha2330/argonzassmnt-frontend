import React, { useState, useEffect, useMemo } from 'react';
import { MentorProfile, Category } from '../types';
import { apiService } from '../services/api';
import '../styles/MentorsPage.css';

const MentorsPage: React.FC = () => {
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
  async function createMentor() {
    try {
      await fetch('/api/mentors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMentor) });
      setNewMentor({ profession: '', specialization: '', bio: '' });
      setShowAddModal(false);
      fetchMentors();
    } catch {}
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
    try {
      const response = await apiService.followMentor(id);
      if (!response.error) {
        setMentors(prev => prev.map(m => m._id === id ? { ...m, total_followers: ((m.total_followers || 0) + 1) } : m));
      }
    } catch {}
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

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Loading mentors...</div>}

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

      <div className="mentors-grid">
        {sortedMentors.map((mentor) => (
          <div key={mentor._id} className="mentor-card">
            <div className="mentor-header">
              <div className="mentor-avatar">👤</div>
              <div className="mentor-info">
                <h3 className="mentor-name">{mentor.profession}</h3>
                <p className="mentor-profession">{mentor.specialization}</p>
              </div>
              <button className="follow-btn" onClick={() => followMentor(mentor._id)}>+ Follow</button>
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
