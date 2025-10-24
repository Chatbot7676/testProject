import React, { useState, useEffect } from 'react';
import { getAllData } from '../services/api';
import './MasterLists.css';

function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await getAllData();
      setInstructors(response.data.data.instructors || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.instructorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="master-list-container">
        <div className="loading">⏳ Loading instructors...</div>
      </div>
    );
  }

  return (
    <div className="master-list-container">
      <div className="master-list-header">
        <h2>👨‍🏫 Instructors Master List</h2>
        <div className="header-stats">
          <div className="stat-badge">
            Total: <strong>{instructors.length}</strong>
          </div>
          <div className="stat-badge">
            Showing: <strong>{filteredInstructors.length}</strong>
          </div>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Search by Instructor ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="clear-search">
            ✕ Clear
          </button>
        )}
      </div>

      {filteredInstructors.length === 0 ? (
        <div className="empty-state">
          <p>📭 No instructors found</p>
          <small>
            {searchTerm
              ? 'Try a different search term'
              : 'No instructors found'}
          </small>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredInstructors.map((instructor) => (
            <div key={instructor._id} className="master-card instructor-card">
              <div className="card-icon">👨‍🏫</div>
              <div className="card-content">
                <h3>{instructor.name}</h3>
                <div className="card-details">
                  <span className="detail-label">Instructor ID:</span>
                  <span className="detail-value">{instructor.instructorId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Instructors;

