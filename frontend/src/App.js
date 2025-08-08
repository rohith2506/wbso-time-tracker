import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Download, BarChart3, LogOut, Edit3, Lock, FileText } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { timeEntriesAPI } from './api/timeEntries';
import './App.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">WBSO Time Tracker</h1>
          <p className="text-gray-600 mt-2">Track your R&D activities for compliance</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-6 text-center">Sign In</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, entriesData] = await Promise.all([
          timeEntriesAPI.getStats(),
          timeEntriesAPI.getEntries()
        ]);
        setStats(statsData);
        setEntries(entriesData.slice(0, 3)); // Recent 3 entries
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total_hours}</div>
              <div className="text-sm text-gray-600">Hours Logged</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.remaining_hours}</div>
              <div className="text-sm text-gray-600">Hours Remaining</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.progress_percentage}%</div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{entries.length}</div>
              <div className="text-sm text-gray-600">Recent Entries</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Time Entries</h3>
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{entry.project_phase}</span>
                    {entry.can_edit ? (
                      <Edit3 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{entry.activity_description.substring(0, 100)}...</p>
                  <p className="text-xs text-gray-500">{entry.technical_challenge.substring(0, 80)}...</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{entry.hours}h</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No time entries yet. Start by logging your first R&D activity!</p>
        )}
      </div>
    </div>
  );
};

const TimeEntry = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    project_phase: 'Research',
    activity_description: '',
    technical_challenge: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const entryData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        hours: parseFloat(formData.hours)
      };
      
      await timeEntriesAPI.createEntry(entryData);
      setSuccess(true);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        project_phase: 'Research',
        activity_description: '',
        technical_challenge: ''
      });
    } catch (error) {
      console.error('Failed to create time entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Log Time Entry</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Time entry saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="12"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.hours}
              onChange={(e) => setFormData({...formData, hours: e.target.value})}
              placeholder="7.5"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Phase</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.project_phase}
            onChange={(e) => setFormData({...formData, project_phase: e.target.value})}
          >
            <option>Research</option>
            <option>Development</option>
            <option>Testing</option>
            <option>Analysis</option>
            <option>Documentation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">R&D Activity Description</label>
          <textarea
            rows="3"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.activity_description}
            onChange={(e) => setFormData({...formData, activity_description: e.target.value})}
            placeholder="Describe the specific R&D work performed (be detailed for WBSO compliance)"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Technical Challenge/Innovation</label>
          <textarea
            rows="2"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.technical_challenge}
            onChange={(e) => setFormData({...formData, technical_challenge: e.target.value})}
            placeholder="Explain the technical uncertainty or innovation aspect"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Time Entry'}
        </button>
      </form>
    </div>
  );
};

const TimeHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await timeEntriesAPI.getEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (entry) => {
    setEditingEntry(entry.id);
    setEditFormData({
      date: new Date(entry.date).toISOString().split('T')[0],
      hours: entry.hours,
      project_phase: entry.project_phase,
      activity_description: entry.activity_description,
      technical_challenge: entry.technical_challenge
    });
  };

  const saveEdit = async () => {
    try {
      const updateData = {
        ...editFormData,
        date: new Date(editFormData.date).toISOString(),
        hours: parseFloat(editFormData.hours)
      };
      
      await timeEntriesAPI.updateEntry(editingEntry, updateData);
      setEditingEntry(null);
      fetchEntries(); // Refresh the list
    } catch (error) {
      console.error('Failed to update entry:', error);
      alert('Failed to update entry. It may be locked (48-hour limit exceeded).');
    }
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditFormData({});
  };

  const exportCSV = () => {
    const csvContent = [
      ['Date', 'Hours', 'Phase', 'Activity Description', 'Technical Challenge'],
      ...entries.map(entry => [
        new Date(entry.date).toLocaleDateString(),
        entry.hours,
        entry.project_phase,
        `"${entry.activity_description.replace(/"/g, '""')}"`,
        `"${entry.technical_challenge.replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wbso-time-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Simple PDF export using browser print
    const printContent = `
      <html>
        <head>
          <title>WBSO Time Entries</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>WBSO Time Entries Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Entries: ${entries.length}</p>
            <p>Total Hours: ${entries.reduce((sum, entry) => sum + entry.hours, 0)}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Hours</th>
                <th>Phase</th>
                <th>Activity Description</th>
                <th>Technical Challenge</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry.hours}</td>
                  <td>${entry.project_phase}</td>
                  <td>${entry.activity_description}</td>
                  <td>${entry.technical_challenge}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <div className="p-6">Loading time history...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Time History</h2>
        <div className="flex gap-2">
          <button 
            onClick={exportCSV}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={exportPDF}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
      
      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Hours</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Phase</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Activity</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {editingEntry === entry.id ? (
                    <>
                      <td className="py-3 px-2">
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                          className="w-full text-xs"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.25"
                          value={editFormData.hours}
                          onChange={(e) => setEditFormData({...editFormData, hours: e.target.value})}
                          className="w-20 text-xs"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={editFormData.project_phase}
                          onChange={(e) => setEditFormData({...editFormData, project_phase: e.target.value})}
                          className="text-xs"
                        >
                          <option>Research</option>
                          <option>Development</option>
                          <option>Testing</option>
                          <option>Analysis</option>
                          <option>Documentation</option>
                        </select>
                      </td>
                      <td className="py-3 px-2">
                        <textarea
                          value={editFormData.activity_description}
                          onChange={(e) => setEditFormData({...editFormData, activity_description: e.target.value})}
                          className="w-full text-xs"
                          rows="2"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-1 text-blue-600 text-xs">
                          <Edit3 className="w-3 h-3" />
                          Editing
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-2">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-2 font-medium">{entry.hours}</td>
                      <td className="py-3 px-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {entry.project_phase}
                        </span>
                      </td>
                      <td className="py-3 px-2 max-w-md truncate">{entry.activity_description}</td>
                      <td className="py-3 px-2">
                        {entry.can_edit ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs">
                            <Edit3 className="w-3 h-3" />
                            Editable
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 text-xs">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {entry.can_edit && (
                          <button
                            onClick={() => startEditing(entry)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No time entries found. Start by logging your first R&D activity!</p>
      )}
    </div>
  );
};

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await timeEntriesAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-semibold text-gray-900">WBSO Time Tracker</h1>
            </div>

            <div className="flex items-center gap-4">
              {user?.project_name && (
                <div className="text-sm text-gray-600">
                  Project: <span className="font-medium text-gray-900">{user.project_name}</span>
                </div>
              )}
              {stats && (
                <div className="text-sm text-gray-600">
                  Progress: <span className="font-medium">{stats.total_hours}/{stats.approved_hours}h</span>
                </div>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('entry')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'entry' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Log Time
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Time History
                </button>
              </div>
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'entry' && <TimeEntry />}
            {activeTab === 'history' && <TimeHistory />}
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <MainApp /> : <LoginForm />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
