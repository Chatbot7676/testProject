import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CsvUpload from './components/CsvUpload';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Instructors from './components/Instructors';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <h1>🎓 Class Scheduler</h1>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                📤 Upload CSV
              </Link>
              <Link to="/students" className="nav-link">
                👨‍🎓 Students
              </Link>
              <Link to="/instructors" className="nav-link">
                👨‍🏫 Instructors
              </Link>
              <Link to="/dashboard" className="nav-link">
                📊 Dashboard
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CsvUpload />} />
            <Route path="/students" element={<Students />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>© 2025 Class Scheduling System | Built with React & Node.js</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
