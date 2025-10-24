import React, { useState, useEffect } from 'react';
import { getAllData } from '../services/api';
import './MasterLists.css';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getAllData();
      setStudents(response.data.data.students || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="master-list-container">
        <div className="loading">⏳ Loading students...</div>
      </div>
    );
  }

  return (
    <div className="master-list-container">
      <div className="master-list-header">
        <h2>👨‍🎓 Students Master List</h2>
        <div className="header-stats">
          <div className="stat-badge">
            Total: <strong>{students.length}</strong>
          </div>
          <div className="stat-badge">
            Showing: <strong>{filteredStudents.length}</strong>
          </div>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Search by Student ID or Name..."
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

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <p>📭 No students found</p>
          <small>
            {searchTerm
              ? 'Try a different search term'
              : 'Click "Seed Database" to add sample students'}
          </small>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredStudents.map((student) => (
            <div key={student._id} className="master-card">
              <div className="card-icon">👨‍🎓</div>
              <div className="card-content">
                <h3>{student.name}</h3>
                <div className="card-details">
                  <span className="detail-label">Student ID:</span>
                  <span className="detail-value">{student.studentId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Students;

