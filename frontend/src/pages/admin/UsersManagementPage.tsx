import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, AdminUserRecord } from '../../services/userService';
import { UserRole } from '../../services/authService';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  KeyRound,
  UserX,
  UserCheck,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  User,
  Clock,
  ShieldAlert
} from 'lucide-react';

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; badgeClass: string; description: string }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    description: 'Full administrative access and user provisioning'
  },
  CONTENT_ADMIN: {
    label: 'Content Admin',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Can manage all programs, news, events, media, and site content'
  },
  EDITOR: {
    label: 'Editor',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    description: 'Can create and edit draft content'
  },
  REVIEWER: {
    label: 'Reviewer',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    description: 'Can review and approve editorial workflows'
  },
  FORM_MANAGER: {
    label: 'Form Manager',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    description: 'Manages inquiries, volunteer applications, and donations'
  }
};

export const UsersManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  // Form states
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONTENT_ADMIN' as UserRole
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newSelectedRole, setNewSelectedRole] = useState<UserRole>('CONTENT_ADMIN');
  const [submittingAction, setSubmittingAction] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers(1, 100, roleFilter);
      setUsers(res.users);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to load administrative users.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'inactive' && !u.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN').length;
    const contentAdmins = users.filter(u => u.role === 'CONTENT_ADMIN').length;
    return { total, active, superAdmins, contentAdmins };
  }, [users]);

  // Add User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim() || !addFormData.email.trim() || !addFormData.password) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }

    if (addFormData.password.length < 8) {
      showNotification('error', 'Password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmittingAction(true);
      await userService.createUser({
        name: addFormData.name.trim(),
        email: addFormData.email.trim().toLowerCase(),
        password: addFormData.password,
        role: addFormData.role
      });
      showNotification('success', `Administrator account for ${addFormData.name} created successfully.`);
      setIsAddModalOpen(false);
      setAddFormData({
        name: '',
        email: '',
        password: '',
        role: 'CONTENT_ADMIN'
      });
      fetchUsers();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to create user account.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (userRecord: AdminUserRecord) => {
    if (userRecord.id === currentUser?.id) {
      showNotification('error', 'You cannot deactivate your own administrative account.');
      return;
    }

    const nextStatus = !userRecord.isActive;
    const actionLabel = nextStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionLabel} account for ${userRecord.name}?`)) {
      return;
    }

    try {
      await userService.setUserActiveStatus(userRecord.id, nextStatus);
      showNotification('success', `Account ${actionLabel}d for ${userRecord.name}.`);
      fetchUsers();
    } catch (err: any) {
      showNotification('error', err?.message || `Failed to ${actionLabel} user.`);
    }
  };

  // Open Role Modal
  const openChangeRoleModal = (userRecord: AdminUserRecord) => {
    setSelectedUser(userRecord);
    setNewSelectedRole(userRecord.role);
    setIsChangeRoleModalOpen(true);
  };

  // Submit Role Change
  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.id === currentUser?.id && newSelectedRole !== 'SUPER_ADMIN') {
      showNotification('error', 'You cannot remove your own Super Admin privileges.');
      return;
    }

    try {
      setSubmittingAction(true);
      await userService.setUserRole(selectedUser.id, newSelectedRole);
      showNotification('success', `Role updated for ${selectedUser.name} to ${ROLE_CONFIG[newSelectedRole]?.label || newSelectedRole}.`);
      setIsChangeRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update user role.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Reset Password Modal
  const openResetPasswordModal = (userRecord: AdminUserRecord) => {
    setSelectedUser(userRecord);
    setResetPasswordValue('');
    setIsResetPasswordModalOpen(true);
  };

  // Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (resetPasswordValue.length < 8) {
      showNotification('error', 'New password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmittingAction(true);
      await userService.resetPassword(selectedUser.id, resetPasswordValue);
      showNotification('success', `Password successfully reset for ${selectedUser.name}.`);
      setIsResetPasswordModalOpen(false);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to reset user password.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Revoke Sessions
  const handleRevokeSessions = async (userRecord: AdminUserRecord) => {
    if (userRecord.id === currentUser?.id) {
      showNotification('error', 'You cannot revoke your own active session here. Use Log Out instead.');
      return;
    }

    if (!window.confirm(`Force terminate all active login sessions for ${userRecord.name}? They will be required to log in again.`)) {
      return;
    }

    try {
      await userService.revokeSessions(userRecord.id);
      showNotification('success', `All active sessions revoked for ${userRecord.name}.`);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to revoke sessions.');
    }
  };

  // Quick generator for secure temporary password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-200 dark:border-charcoal-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-forest-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display">
            User & Administrator Management
          </h1>
          <p className="mt-1 text-sm text-charcoal-600 dark:text-warm-300 max-w-2xl">
            Provision team accounts, configure administrative privileges, reset credentials, and oversee staff access across Mwancha Senior Community.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-700 dark:text-warm-200 hover:bg-warm-100 dark:hover:bg-charcoal-800 transition-colors shadow-xs"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* Global Toast / Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-3 text-sm font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-warm-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-charcoal-500 dark:text-warm-400 uppercase tracking-wider">
            Total Staff Accounts
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-warm-50 font-display">
            {metrics.total}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Active Accounts
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
            {metrics.active}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
            Super Admins
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-display">
            {metrics.superAdmins}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
          <div className="text-xs font-semibold text-forest-700 dark:text-forest-400 uppercase tracking-wider">
            Content Admins
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-forest-700 dark:text-forest-300 font-display">
            {metrics.contentAdmins}
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by legal name or email address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-warm-300 dark:border-charcoal-700 bg-warm-50/50 dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-800 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Administrator</option>
            <option value="CONTENT_ADMIN">Content Administrator</option>
            <option value="EDITOR">Editor</option>
            <option value="REVIEWER">Reviewer</option>
            <option value="FORM_MANAGER">Form Manager</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-800 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-warm-200 dark:border-charcoal-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-forest-700 dark:text-emerald-400 animate-spin" />
            <p className="mt-3 text-sm text-charcoal-500 dark:text-warm-400">Loading MSC administrator directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Users className="w-12 h-12 mx-auto text-charcoal-300 dark:text-charcoal-600" />
            <h3 className="mt-3 text-base font-bold text-charcoal-900 dark:text-warm-100">No Administrators Found</h3>
            <p className="mt-1 text-xs text-charcoal-500 dark:text-warm-400 max-w-sm mx-auto">
              No accounts match the current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm text-charcoal-700 dark:text-warm-200">
              <thead className="bg-warm-50 dark:bg-charcoal-950/70 text-xs font-bold uppercase tracking-wider text-charcoal-600 dark:text-warm-400 border-b border-warm-200 dark:border-charcoal-800">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Administrator</th>
                  <th scope="col" className="px-6 py-3.5">Assigned Role</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Last Login</th>
                  <th scope="col" className="px-6 py-3.5">Created</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800/80">
                {filteredUsers.map((u) => {
                  const roleMeta = ROLE_CONFIG[u.role] || {
                    label: u.role,
                    badgeClass: 'bg-gray-100 text-gray-800 border-gray-200'
                  };
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-warm-50/60 dark:hover:bg-charcoal-800/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200 font-bold flex items-center justify-center shrink-0 border border-forest-200 dark:border-forest-800">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-charcoal-900 dark:text-warm-50 flex items-center gap-2">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-900/80 text-forest-800 dark:text-emerald-300">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-charcoal-500 dark:text-warm-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-charcoal-400" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleMeta.badgeClass}`}>
                          <Shield className="w-3 h-3" />
                          <span>{roleMeta.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-rose-600 dark:bg-rose-400'
                            }`}
                          />
                          <span>{u.isActive ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4 text-xs text-charcoal-500 dark:text-warm-400">
                        {u.lastLoginAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(u.lastLoginAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="italic text-charcoal-400">Never signed in</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-xs text-charcoal-500 dark:text-warm-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role edit */}
                          <button
                            onClick={() => openChangeRoleModal(u)}
                            className="p-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:text-forest-800 hover:border-forest-600 transition-colors"
                            title="Change Role"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset password */}
                          <button
                            onClick={() => openResetPasswordModal(u)}
                            className="p-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:text-forest-800 hover:border-forest-600 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Revoke sessions */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleRevokeSessions(u)}
                              className="p-1.5 rounded-lg border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-200 hover:text-amber-700 hover:border-amber-600 transition-colors"
                              title="Force Terminate Sessions"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Toggle Active status */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                u.isActive
                                  ? 'border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                                  : 'border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              }`}
                              title={u.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD ADMINISTRATOR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-charcoal-900 rounded-2xl shadow-elevated border border-warm-200 dark:border-charcoal-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-warm-100 dark:border-charcoal-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 dark:text-warm-50 font-display">
                    Provision New Administrator
                  </h3>
                  <p className="text-xs text-charcoal-500 dark:text-warm-400">
                    Create credentials and assign an organizational privilege tier
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600 dark:hover:text-warm-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  placeholder="e.g. Achaa Kevin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  placeholder="name@mwanchasenior.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Administrative Privilege Tier *
                </label>
                <select
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="CONTENT_ADMIN">Content Administrator (Full CMS Management)</option>
                  <option value="EDITOR">Editor / Staff (Draft & Edit)</option>
                  <option value="REVIEWER">Reviewer / Approver</option>
                  <option value="FORM_MANAGER">Volunteer & Donor Manager</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full System Authority)</option>
                </select>
                <p className="mt-1 text-[11px] text-charcoal-500 dark:text-warm-400">
                  {ROLE_CONFIG[addFormData.role]?.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300">
                    Initial Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateStrongPassword();
                      setAddFormData({ ...addFormData, password: pass });
                      setShowAddPassword(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 dark:text-emerald-400 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Secure Key</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    value={addFormData.password}
                    onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-charcoal-900 dark:text-warm-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400 hover:text-charcoal-600 dark:hover:text-warm-200"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-warm-100 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 text-charcoal-700 dark:text-warm-200 text-sm font-semibold hover:bg-warm-100 dark:hover:bg-charcoal-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {submittingAction ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Administrator</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE ROLE */}
      {isChangeRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-charcoal-900 rounded-2xl shadow-elevated border border-warm-200 dark:border-charcoal-800 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100 dark:border-charcoal-800">
              <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50 font-display">
                Change Assigned Role
              </h3>
              <button
                onClick={() => setIsChangeRoleModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangeRole} className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-warm-50 dark:bg-charcoal-950 border border-warm-200 dark:border-charcoal-800 text-xs">
                <div className="font-bold text-charcoal-900 dark:text-warm-100">{selectedUser.name}</div>
                <div className="text-charcoal-500 dark:text-warm-400">{selectedUser.email}</div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300 mb-1.5">
                  Select New Role
                </label>
                <select
                  value={newSelectedRole}
                  onChange={(e) => setNewSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-sm text-charcoal-900 dark:text-warm-100"
                >
                  <option value="CONTENT_ADMIN">Content Administrator</option>
                  <option value="EDITOR">Editor</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="FORM_MANAGER">Form Manager</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
                <p className="mt-1 text-[11px] text-charcoal-500 dark:text-warm-400">
                  {ROLE_CONFIG[newSelectedRole]?.description}
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-warm-100 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsChangeRoleModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-warm-300 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-warm-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold shadow-sm"
                >
                  {submittingAction ? 'Updating...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {isResetPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-charcoal-900 rounded-2xl shadow-elevated border border-warm-200 dark:border-charcoal-800 p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-warm-100 dark:border-charcoal-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-forest-800 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-charcoal-900 dark:text-warm-50 font-display">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div className="p-3 rounded-xl bg-warm-50 dark:bg-charcoal-950 border border-warm-200 dark:border-charcoal-800 text-xs">
                <div className="font-bold text-charcoal-900 dark:text-warm-100">{selectedUser.name}</div>
                <div className="text-charcoal-500 dark:text-warm-400">{selectedUser.email}</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-warm-300">
                    New Temporary Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateStrongPassword();
                      setResetPasswordValue(pass);
                      setShowResetPassword(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 dark:text-emerald-400 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    placeholder="Enter at least 8 characters"
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-white dark:bg-charcoal-950 text-sm font-mono text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-warm-100 dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-warm-300 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-warm-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold shadow-sm"
                >
                  {submittingAction ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;
