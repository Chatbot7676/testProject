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

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  
  // If it's already in HH:MM format, return as is
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  
  // If it contains a date, parse and extract time
  try {
    const date = new Date(timeStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (e) {
    // If parsing fails, try to extract time pattern
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[1] : timeStr;
  }
};

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

  const getClassesPerDay = () => {
    const classesByDate = {};
    
    data.schedules
      ?.filter((s) => s.status !== 'deleted')
      .forEach((schedule) => {
        const date = formatDate(schedule.date);
        classesByDate[date] = (classesByDate[date] || 0) + 1;
      });

    return Object.keys(classesByDate)
      .sort((a, b) => {
        // Sort by date (dd/mm/yyyy format)
        const [dayA, monthA, yearA] = a.split('/');
        const [dayB, monthB, yearB] = b.split('/');
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
      })
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

  const getFilteredSchedules = () => {
    return data.schedules?.filter((schedule) => {
      if (schedule.status === 'deleted') return false;
      
      if (filters.date) {
        const scheduleDate = formatDate(schedule.date);
        if (scheduleDate !== filters.date) {
          return false;
        }
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
      <h2>📊 Excellence Driving - Class Scheduling Dashboard</h2>

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
        <h3>📈 Driving Lessons Per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={classesPerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              style={{ fontSize: '12px', fill: '#333' }}
            />
            <YAxis style={{ fontSize: '12px', fill: '#333' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid #002b5c',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="classes" 
              stroke="#002b5c" 
              strokeWidth={3} 
              name="Lessons"
              dot={{ fill: '#ffc300', r: 5 }}
              activeDot={{ r: 7, fill: '#ffc300' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Instructor Stats Chart */}
      <div className="chart-section">
        <h3>👨‍🏫 Driving Lessons Per Instructor</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={instructorStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              style={{ fontSize: '12px', fill: '#333' }}
            />
            <YAxis style={{ fontSize: '12px', fill: '#333' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid #002b5c',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="classes" 
              fill="#002b5c" 
              name="Lessons"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>🔍 Filter Schedules</h3>
        <div className="filters-grid">
          <div className="filter-with-label">
            <label>📅 Date (dd/mm/yyyy)</label>
            <input
              type="date"
              name="date"
              value={filters.date ? 
                (() => {
                  const [day, month, year] = filters.date.split('/');
                  return `${year}-${month}-${day}`;
                })() : ''
              }
              onChange={(e) => {
                if (e.target.value) {
                  const [year, month, day] = e.target.value.split('-');
                  setFilters({ ...filters, date: `${day}/${month}/${year}` });
                } else {
                  setFilters({ ...filters, date: '' });
                }
              }}
              className="filter-input date-input"
            />
          </div>
          <div className="filter-with-label">
            <label>👨‍🏫 Instructor ID</label>
            <input
              type="text"
              name="instructor"
              placeholder="Filter by instructor ID"
              value={filters.instructor}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          <div className="filter-with-label">
            <label>🎯 Class Type ID</label>
            <input
              type="text"
              name="classType"
              placeholder="Filter by class type ID"
              value={filters.classType}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          <div className="filter-with-label">
            <label>👨‍🎓 Student ID</label>
            <input
              type="text"
              name="student"
              placeholder="Filter by student ID"
              value={filters.student}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          <div className="filter-with-label">
            <label>&nbsp;</label>
            <button onClick={clearFilters} className="clear-button">
              🔄 Clear Filters
            </button>
          </div>
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
                    <td>{formatDate(schedule.date)}</td>
                    <td>{formatTime(schedule.startTime)}</td>
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

