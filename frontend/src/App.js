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
              <div className="logo-icon">🚗</div>
              <div className="logo-text">
                <h1>Excellence Driving</h1>
                <p className="tagline">NO.1 DRIVING SCHOOL IN UAE</p>
              </div>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                📊 Dashboard
              </Link>
              <Link to="/students" className="nav-link">
                👨‍🎓 Students
              </Link>
              <Link to="/instructors" className="nav-link">
                👨‍🏫 Instructors
              </Link>
              <Link to="/upload" className="nav-link">
                📤 Upload Schedule
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/upload" element={<CsvUpload />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Excellence Driving</h3>
              <p>NO.1 DRIVING SCHOOL IN UAE</p>
              <p>PO Box - 446241</p>
              <p>Al Qusais Industrial Area - 5</p>
              <p>Dubai, United Arab Emirates</p>
            </div>
            <div className="footer-section">
              <h3>Contact</h3>
              <p>📞 600515154</p>
              <p>✉️ info@excellencedriving.com</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <p>Car License | Motorcycle License</p>
              <p>Heavy Bus | Heavy Truck</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Excellence Driving School. All Rights Reserved | Created by Abdulla Azizulla</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
