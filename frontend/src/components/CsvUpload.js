import React, { useState } from 'react';
import { uploadCSV } from '../services/api';
import './CsvUpload.css';

function CsvUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResults(null);
    setUploadProgress(0);

    try {
      const response = await uploadCSV(file, (progress) => {
        setUploadProgress(progress);
      });

      setResults(response.data);
      setUploading(false);
      setUploadProgress(100);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' ? '#4caf50' : '#f44336';
  };

  return (
    <div className="csv-upload-container">
      <div className="upload-card">
        <h2>📤 Upload Driving Class Schedule</h2>
        <p className="description">
          Upload a CSV file with driving lesson schedules. Columns: Registration ID, Student ID, Instructor ID, Class ID, Class Start Time, Action
        </p>

        <div className="upload-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="file-input"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="file-label">
            {file ? `📄 ${file.name}` : '📁 Choose CSV File'}
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-button"
          >
            {uploading ? '⏳ Uploading...' : '🚀 Upload & Process'}
          </button>
        </div>

        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">{uploadProgress}%</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {results && (
          <div className="results-container">
            <div className="summary-cards">
              <div className="summary-card success">
                <h3>{results.summary?.success || 0}</h3>
                <p>✅ Successful</p>
              </div>
              <div className="summary-card error">
                <h3>{results.summary?.errors || 0}</h3>
                <p>❌ Errors</p>
              </div>
              <div className="summary-card total">
                <h3>{results.totalRows || 0}</h3>
                <p>📊 Total Rows</p>
              </div>
            </div>

            <div className="results-table-container">
              <h3>Detailed Results</h3>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Registration ID</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results?.map((result, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(result.status) }}
                        >
                          {result.status === 'success' ? '✅' : '❌'} {result.status}
                        </span>
                      </td>
                      <td className="message-cell">{result.message}</td>
                      <td className="registration-id">
                        {result.registrationId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CsvUpload;

