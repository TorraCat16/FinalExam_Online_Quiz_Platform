import { useState, useEffect } from 'react';
import { userAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

/**
 * Manage Users Page (Admin)
 * 
 * USER FLOW CONTEXT:
 * Login → Dashboard → [MANAGE USERS] → Assign roles
 * 
 * PURPOSE:
 * View all users and manage their roles.
 * Only admins can access this page.
 * 
 * FEATURES:
 * - List all users
 * - Change user roles (student, teacher, admin)
 * - Search/filter users (future enhancement)
 * 
 * SECURITY NOTE:
 * - Cannot change own role (prevents accidental lockout)
 * - Role changes take effect immediately
 */
export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId, newRole) {
    // Prevent changing own role
    if (userId === currentUser.id) {
      setError("You cannot change your own role");
      return;
    }

    setUpdatingId(userId);
    setError('');
    setSuccess('');

    try {
      await userAPI.updateRole(userId, newRole);
      setSuccess('Role updated successfully');
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      setError(err.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteUser(userId, username) {
    // Prevent deleting own account
    if (userId === currentUser.id) {
      setError("You cannot delete your own account");
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    setUpdatingId(userId);
    setError('');
    setSuccess('');

    try {
      await userAPI.delete(userId);
      setSuccess('User deleted successfully');

      // Remove from local state
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setUpdatingId(null);
    }
  }

  // Calculate stats
  const totalUsers = users.length;
  const byRole = {
    student: users.filter(u => u.role === 'student').length,
    teacher: users.filter(u => u.role === 'teacher' || u.role === 'staff').length,
    admin: users.filter(u => u.role === 'admin').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="manage-users-page">
      <header className="page-header">
        <h1>Manage Users</h1>
        <p>View and manage user roles</p>
      </header>

      {/* Stats Summary */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-count">{totalUsers}</span>
          <span className="stat-name">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-count students">{byRole.student}</span>
          <span className="stat-name">Students</span>
        </div>
        <div className="stat-item">
          <span className="stat-count teachers">{byRole.teacher}</span>
          <span className="stat-name">Teachers</span>
        </div>
        <div className="stat-item">
          <span className="stat-count admins">{byRole.admin}</span>
          <span className="stat-name">Admins</span>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={u.id === currentUser.id ? 'current-user' : ''}>
                  <td className="id-cell">{u.id}</td>
                  <td className="username-cell">
                    {u.username}
                    {u.id === currentUser.id && <span className="you-badge">You</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${getRoleBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.id === currentUser.id ? (
                      <span className="no-change">Cannot change own role</span>
                    ) : (
                      <div className="role-actions">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          disabled={updatingId === u.id}
                          className="role-select"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                        {updatingId === u.id && (
                          <span className="updating">Updating...</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {u.id === currentUser.id ? (
                      <span className="no-change">-</span>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteUser(u.id, u.username)}
                        disabled={updatingId === u.id}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .page-header {
          margin-bottom: var(--space-xl);
        }
        
        .page-header h1 {
          margin-bottom: var(--space-xs);
        }
        
        .page-header p {
          color: var(--color-text-light);
          margin: 0;
        }
        
        .stats-bar {
          display: flex;
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
          padding: var(--space-md) var(--space-lg);
          background: white;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--color-border);
        }
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .stat-count {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-text);
        }
        
        .stat-count.students { color: var(--color-success); }
        .stat-count.teachers { color: var(--color-primary); }
        .stat-count.admins { color: var(--color-error); }
        
        .stat-name {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
        }
        
        .id-cell {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
        }
        
        .username-cell {
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .you-badge {
          font-size: var(--font-size-sm);
          padding: 2px 6px;
          background: var(--color-primary);
          color: white;
          border-radius: 4px;
          font-weight: 400;
        }
        
        .current-user {
          background: #eff6ff;
        }
        
        .role-actions {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .role-select {
          padding: var(--space-xs) var(--space-sm);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          background: white;
          cursor: pointer;
        }
        
        .role-select:hover {
          border-color: var(--color-primary);
        }
        
        .role-select:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .updating {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .no-change {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

/**
 * Get badge class based on role
 */
function getRoleBadgeClass(role) {
  switch (role) {
    case 'admin':
      return 'error';
    case 'teacher':
    case 'staff':
      return 'primary';
    case 'student':
    default:
      return 'success';
  }
}
