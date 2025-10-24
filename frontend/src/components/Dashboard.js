import React, { useState, useEffect } from 'react';
import { getAllData } from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    instructor: '',
    classType: '',
    student: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getAllData();
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">⏳ Loading dashboard data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-container">
        <div className="error">❌ Error loading data</div>
      </div>
    );
  }

  // Process data for charts
  const getClassesPerDay = () => {
    const classesByDate = {};
    
    data.schedules
      ?.filter((s) => s.status !== 'deleted')
      .forEach((schedule) => {
        const date = new Date(schedule.date).toLocaleDateString();
        classesByDate[date] = (classesByDate[date] || 0) + 1;
      });

    return Object.keys(classesByDate)
      .sort()
      .map((date) => ({
        date,
        classes: classesByDate[date],
      }));
  };

  const getInstructorStats = () => {
    const instructorCounts = {};
    
    data.schedules
      ?.filter((s) => s.status !== 'deleted')
      .forEach((schedule) => {
        const instructor = data.instructors?.find(
          (i) => i.instructorId === schedule.instructorId
        );
        const name = instructor?.name || schedule.instructorId;
        instructorCounts[name] = (instructorCounts[name] || 0) + 1;
      });

    return Object.keys(instructorCounts).map((name) => ({
      name,
      classes: instructorCounts[name],
    }));
  };

  // Filter schedules based on filters
  const getFilteredSchedules = () => {
    return data.schedules?.filter((schedule) => {
      if (schedule.status === 'deleted') return false;
      
      if (filters.date && !new Date(schedule.date).toLocaleDateString().includes(filters.date)) {
        return false;
      }
      
      if (filters.instructor && !schedule.instructorId.toLowerCase().includes(filters.instructor.toLowerCase())) {
        return false;
      }
      
      if (filters.classType && !schedule.classTypeId.toLowerCase().includes(filters.classType.toLowerCase())) {
        return false;
      }
      
      if (filters.student && !schedule.studentId.toLowerCase().includes(filters.student.toLowerCase())) {
        return false;
      }
      
      return true;
    }) || [];
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      instructor: '',
      classType: '',
      student: '',
    });
  };

  const classesPerDay = getClassesPerDay();
  const instructorStats = getInstructorStats();
  const filteredSchedules = getFilteredSchedules();

  return (
    <div className="dashboard-container">
      <h2>📊 Class Scheduling Dashboard</h2>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{data.schedules?.filter(s => s.status !== 'deleted').length || 0}</div>
          <div className="stat-label">📅 Total Schedules</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.students?.length || 0}</div>
          <div className="stat-label">👨‍🎓 Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.instructors?.length || 0}</div>
          <div className="stat-label">👨‍🏫 Instructors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.classTypes?.length || 0}</div>
          <div className="stat-label">🎯 Class Types</div>
        </div>
      </div>

      {/* Classes Per Day Chart */}
      <div className="chart-section">
        <h3>📈 Classes Per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={classesPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="classes" stroke="#2196f3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Instructor Stats Chart */}
      <div className="chart-section">
        <h3>👨‍🏫 Classes Per Instructor</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={instructorStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="classes" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>🔍 Filter Schedules</h3>
        <div className="filters-grid">
          <input
            type="text"
            name="date"
            placeholder="Filter by date"
            value={filters.date}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="text"
            name="instructor"
            placeholder="Filter by instructor ID"
            value={filters.instructor}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="text"
            name="classType"
            placeholder="Filter by class type ID"
            value={filters.classType}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="text"
            name="student"
            placeholder="Filter by student ID"
            value={filters.student}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <button onClick={clearFilters} className="clear-button">
            🔄 Clear Filters
          </button>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="table-section">
        <h3>📋 Schedules ({filteredSchedules.length})</h3>
        <div className="table-container">
          <table className="schedules-table">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Student</th>
                <th>Instructor</th>
                <th>Class Type</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No schedules found
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule._id}>
                    <td className="mono">{schedule.registrationId}</td>
                    <td>{schedule.studentId}</td>
                    <td>{schedule.instructorId}</td>
                    <td>{schedule.classTypeId}</td>
                    <td>{new Date(schedule.date).toLocaleDateString()}</td>
                    <td>{schedule.startTime}</td>
                    <td>{schedule.duration || 45} min</td>
                    <td>
                      <span className={`status-badge ${schedule.status}`}>
                        {schedule.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

