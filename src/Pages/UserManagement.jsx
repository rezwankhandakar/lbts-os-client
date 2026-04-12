

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import {
  MoreVertical,
  UserCheck,
  UserX,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Search,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../Component/LoadingSpinner';

const ROLE_CONFIG = {
  admin:    { label: 'Admin',    bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-100' },
  manager:  { label: 'Manager',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100'   },
  operator: { label: 'Operator', bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-100' },
  ceo:      { label: 'CEO',      bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100'  },
  user:     { label: 'User',     bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200'   },
};

const STATUS_CONFIG = {
  approved: { label: 'Active',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-100',    dot: 'bg-rose-500'    },
  pending:  { label: 'Pending',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100',   dot: 'bg-amber-500'   },
};

const UserManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: users = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users');
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // ── Search filter ──────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const s = searchText.toLowerCase();
    return (
      !searchText ||
      u.displayName?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.role?.toLowerCase().includes(s)
    );
  });

  // ── Stats ──────────────────────────────────────────────────────
  const stats = {
    total:    users.length,
    approved: users.filter((u) => u.status === 'approved').length,
    pending:  users.filter((u) => u.status === 'pending').length,
    rejected: users.filter((u) => u.status === 'rejected').length,
  };

  const toastSuccess = (msg) => Swal.fire({
    toast: true, position: 'top-end', icon: 'success',
    title: msg, showConfirmButton: false, timer: 2000,
  });

  const handleRole = async (id, role) => {
    setLoadingId(id);
    try {
      await axiosSecure.patch(`/users/role/${id}`, { role });
      toastSuccess(`Role changed to ${role}`);
      setOpenDropdownId(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      Swal.fire('Error!', 'Role update failed', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatus = async (id, status) => {
    setLoadingId(id);
    try {
      await axiosSecure.patch(`/users/status/${id}`, { status });
      toastSuccess(`Status changed to ${status}`);
      setOpenDropdownId(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      Swal.fire('Error!', 'Status update failed', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      html: `<p class="text-sm text-gray-500">This will permanently delete <b>${name}</b>. This cannot be undone.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
    });
    if (result.isConfirmed) {
      setLoadingId(id);
      try {
        await axiosSecure.delete(`/users/${id}`);
        toastSuccess('User deleted');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } catch {
        Swal.fire('Error!', 'Delete failed', 'error');
      } finally {
        setLoadingId(null);
      }
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading users..." />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <p className="text-red-500 font-medium">Failed to load users</p>
      <button onClick={() => refetch()} className="text-sm text-indigo-600 underline">Try again</button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users size={24} className="text-indigo-600" /> User Management
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage roles, status, and permissions</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Users',  value: stats.total,    color: 'text-indigo-600', bg: 'bg-indigo-50'  },
            { label: 'Active',       value: stats.approved, color: 'text-emerald-600',bg: 'bg-emerald-50' },
            { label: 'Pending',      value: stats.pending,  color: 'text-amber-600',  bg: 'bg-amber-50'   },
            { label: 'Rejected',     value: stats.rejected, color: 'text-rose-600',   bg: 'bg-rose-50'    },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white`}>
              <p className="text-xs font-medium text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const roleConf   = ROLE_CONFIG[user.role]   || ROLE_CONFIG.user;
                  const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.pending;
                  const isActionLoading = loadingId === user._id;

                  return (
                    <tr key={user._id} className={`hover:bg-gray-50/50 transition-colors ${isActionLoading ? 'opacity-50' : ''}`}>

                      {/* User info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
                              alt=""
                              className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm object-cover"
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`; }}
                            />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusConf.dot}`}></span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.displayName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border capitalize ${roleConf.bg} ${roleConf.text} ${roleConf.border}`}>
                          {roleConf.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}></span>
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right relative" ref={openDropdownId === user._id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === user._id ? null : user._id)}
                          disabled={isActionLoading}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40"
                        >
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>

                        {openDropdownId === user._id && (
                          <div className="absolute right-6 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">

                            <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/80">
                              Manage Status
                            </p>
                            <button onClick={() => handleStatus(user._id, 'approved')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                              <UserCheck size={15} /> Approve User
                            </button>
                            <button onClick={() => handleStatus(user._id, 'rejected')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border-b border-gray-100">
                              <UserX size={15} /> Reject User
                            </button>

                            <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/80">
                              Assign Role
                            </p>
                            <button onClick={() => handleRole(user._id, 'manager')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                              <ShieldCheck size={15} /> Make Manager
                            </button>
                            <button onClick={() => handleRole(user._id, 'operator')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                              <UserPlus size={15} /> Make Operator
                            </button>
                            <button onClick={() => handleRole(user._id, 'ceo')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border-b border-gray-100">
                              <UserPlus size={15} /> Make CEO
                            </button>

                            <button onClick={() => handleDelete(user._id, user.displayName)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-600 hover:text-white transition-colors mt-1">
                              <Trash2 size={15} /> Delete Account
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="text-center py-16 text-gray-400 italic text-sm">
                      {searchText ? `No users found matching "${searchText}"` : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;