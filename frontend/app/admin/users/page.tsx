'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { User } from '@/types';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  StarIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState<{
    action: string;
    userId: number;
    userName: string;
    targetRole: string;
  } | null>(null);

  useEffect(() => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setCurrentUser(parsed?.state?.user || null);
      } catch (e) {}
    }
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.items || []);
    } catch (err: any) {
      setError('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showNotification = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const isCurrentUser = (userId: number) => currentUser?.id === userId;
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleRoleChange = async () => {
    if (!showConfirm) return;
    const { action, userId, userName } = showConfirm;
    
    try {
      const endpoints: Record<string, string> = {
        'promote': `/admin/users/${userId}/promote`,
        'demote': `/admin/users/${userId}/demote`,
        'make-super': `/admin/users/${userId}/make-super-admin`,
        'remove-super': `/admin/users/${userId}/remove-super-admin`,
      };
      
      await api.put(endpoints[action]);
      const messages: Record<string, string> = {
        'promote': `${userName} promoted to admin`,
        'demote': `${userName} demoted to customer`,
        'make-super': `${userName} is now a Super Admin`,
        'remove-super': `${userName} super admin privileges removed`,
      };
      showNotification(messages[action] || 'Role updated');
      fetchUsers();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : 'Action failed');
    } finally {
      setShowConfirm(null);
    }
  };

  const handleToggleStatus = async (userId: number, userName: string, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} "${userName}"?`)) return;
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      showNotification(`User ${isActive ? 'deactivated' : 'activated'}!`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Super Admin', icon: StarIconSolid };
      case 'admin':
        return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin', icon: null };
      default:
        return { bg: 'bg-stone-100', text: 'text-stone-600', label: 'Customer', icon: null };
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Users</h1>
          <p className="text-stone-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <button onClick={fetchUsers} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          ↻ Refresh
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Confirm Role Change</h3>
            <p className="text-stone-600 mb-6">
              {showConfirm.action === 'make-super' 
                ? `Make ${showConfirm.userName} a Super Admin? They will have full system access.`
                : showConfirm.action === 'remove-super'
                ? `Remove Super Admin privileges from ${showConfirm.userName}?`
                : `${showConfirm.action.charAt(0).toUpperCase() + showConfirm.action.slice(1)} ${showConfirm.userName}${showConfirm.action === 'promote' ? ' to admin' : ' to customer'}?`}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-stone-50">Cancel</button>
              <button onClick={handleRoleChange} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-stone-50">
              <th className="text-left p-4 text-sm font-medium text-stone-600">User</th>
              <th className="text-left p-4 text-sm font-medium text-stone-600">Email</th>
              <th className="text-left p-4 text-sm font-medium text-stone-600">Username</th>
              <th className="text-left p-4 text-sm font-medium text-stone-600">Role</th>
              <th className="text-left p-4 text-sm font-medium text-stone-600">Status</th>
              <th className="text-right p-4 text-sm font-medium text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center p-8">Loading...</td></tr>
            ) : (
              users.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const RoleIcon = roleBadge.icon;
                
                return (
                  <tr key={user.id} className="border-b hover:bg-stone-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          user.role === 'super_admin' ? 'bg-yellow-100' : 
                          user.role === 'admin' ? 'bg-purple-100' : 'bg-primary-100'
                        }`}>
                          <span className="font-medium text-sm">{user.full_name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="font-medium">{user.full_name}</span>
                          {isCurrentUser(user.id) && <span className="text-xs text-primary-600 ml-2">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{user.email}</td>
                    <td className="p-4 text-sm text-stone-500">@{user.username}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${roleBadge.bg} ${roleBadge.text}`}>
                        {RoleIcon && <RoleIcon className="h-3 w-3" />}
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrentUser(user.id) && (
                          <>
                            {/* Super Admin can manage super admin roles */}
                            {isSuperAdmin && user.role !== 'super_admin' && (
                              <button
                                onClick={() => setShowConfirm({ action: 'make-super', userId: user.id, userName: user.full_name, targetRole: 'super_admin' })}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                              >
                                <StarIcon className="h-3.5 w-3.5" />
                                Super Admin
                              </button>
                            )}
                            {isSuperAdmin && user.role === 'super_admin' && (
                              <button
                                onClick={() => setShowConfirm({ action: 'remove-super', userId: user.id, userName: user.full_name, targetRole: 'admin' })}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 hover:bg-orange-100"
                              >
                                <ArrowDownIcon className="h-3.5 w-3.5" />
                                Remove Super
                              </button>
                            )}
                            {/* Promote/Demote between admin and customer */}
                            {user.role !== 'super_admin' && (
                              <button
                                onClick={() => setShowConfirm({ 
                                  action: user.role === 'admin' ? 'demote' : 'promote',
                                  userId: user.id, 
                                  userName: user.full_name, 
                                  targetRole: user.role === 'admin' ? 'customer' : 'admin'
                                })}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                  user.role === 'admin'
                                    ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                }`}
                              >
                                {user.role === 'admin' ? (
                                  <><ArrowDownIcon className="h-3.5 w-3.5" /> Demote</>
                                ) : (
                                  <><ArrowUpIcon className="h-3.5 w-3.5" /> Make Admin</>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStatus(user.id, user.full_name, user.is_active)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                user.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                              }`}
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </>
                        )}
                        {isCurrentUser(user.id) && <span className="text-xs text-stone-400">Current session</span>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-xs text-stone-500">Total Users</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-yellow-700">{users.filter(u => u.role === 'super_admin').length}</p>
          <p className="text-xs text-stone-500">Super Admins</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-purple-700">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-xs text-stone-500">Admins</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-700">{users.filter(u => u.is_active).length}</p>
          <p className="text-xs text-stone-500">Active</p>
        </div>
      </div>
    </div>
  );
}
