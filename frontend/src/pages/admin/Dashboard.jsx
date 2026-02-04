import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, quizAPI } from '../../api';

/**
 * Admin Dashboard
 * 
 * USER FLOW CONTEXT:
 * Login → [DASHBOARD] → Manage users → Assign roles → View reports
 * 
 * PURPOSE:
 * System overview for administrators.
 * Quick access to user management and system reports.
 * 
 * DISPLAYS:
 * 1. Welcome message
 * 2. System stats (total users by role, total quizzes)
 * 3. Quick action buttons
 * 4. Recent users preview
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Data state
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [usersData, quizzesData] = await Promise.all([
        userAPI.getAll(),
        quizAPI.getAll()
      ]);
      
      setUsers(usersData);
      setQuizzes(quizzesData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate stats
  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher' || u.role === 'staff').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user.username}. Manage your platform here.</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{studentCount}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{teacherCount}</div>
          <div className="stat-label">Teachers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{quizzes.length}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/users" className="btn btn-primary">
            Manage Users
          </Link>
          <Link to="/admin/reports" className="btn btn-secondary">
            System Reports
          </Link>
        </div>
      </section>

      {/* User Distribution */}
      <section className="section">
        <h2>User Distribution</h2>
        <div className="distribution-bars">
          <div className="bar-item">
            <div className="bar-label">
              <span>Students</span>
              <span>{studentCount}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill students" 
                style={{ width: users.length ? `${(studentCount / users.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className="bar-item">
            <div className="bar-label">
              <span>Teachers</span>
              <span>{teacherCount}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill teachers" 
                style={{ width: users.length ? `${(teacherCount / users.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className="bar-item">
            <div className="bar-label">
              <span>Admins</span>
              <span>{adminCount}</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill admins" 
                style={{ width: users.length ? `${(adminCount / users.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Users */}
      <section className="section">
        <div className="section-header">
          <h2>Recent Users</h2>
          <Link to="/admin/users">View All →</Link>
        </div>
        
        <div className="table-container card">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map(u => (
                <tr key={u.id}>
                  <td className="username-cell">{u.username}</td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'error' : u.role === 'teacher' || u.role === 'staff' ? 'primary' : 'success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <Link to="/admin/users" className="btn btn-secondary btn-sm">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .dashboard-header {
          margin-bottom: var(--space-xl);
        }
        
        .dashboard-header h1 {
          margin-bottom: var(--space-xs);
        }
        
        .dashboard-header p {
          color: var(--color-text-light);
          margin-bottom: 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }
        
        .stat-card {
          background: white;
          padding: var(--space-lg);
          border-radius: var(--border-radius-lg);
          text-align: center;
          border: 1px solid var(--color-border);
        }
        
        .stat-value {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--color-primary);
        }
        
        .stat-label {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
        }
        
        .quick-actions {
          margin-bottom: var(--space-xl);
        }
        
        .quick-actions h2 {
          margin-bottom: var(--space-md);
        }
        
        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
        }
        
        .section {
          margin-bottom: var(--space-xl);
        }
        
        .section h2 {
          margin-bottom: var(--space-md);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }
        
        .section-header h2 {
          margin: 0;
        }
        
        .distribution-bars {
          background: white;
          padding: var(--space-lg);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        
        .bar-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
        
        .bar-label {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-sm);
        }
        
        .bar-track {
          height: 8px;
          background: var(--color-bg);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .bar-fill.students {
          background: var(--color-success);
        }
        
        .bar-fill.teachers {
          background: var(--color-primary);
        }
        
        .bar-fill.admins {
          background: var(--color-error);
        }
        
        .username-cell {
          font-weight: 500;
        }
        
        .btn-sm {
          padding: var(--space-xs) var(--space-sm);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </div>
  );
}
