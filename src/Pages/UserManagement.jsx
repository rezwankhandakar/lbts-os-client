
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import {
  MoreVertical, UserCheck, UserX, ShieldCheck,
  Trash2, UserPlus, Users, Search, RefreshCw, X, Check,
} from 'lucide-react';
import LoadingSpinner from '../Component/LoadingSpinner';

const ROLE_CONFIG = {
  admin:    { label: 'Admin',    bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-100' },
  manager:  { label: 'Manager',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100'   },
  operator: { label: 'Operator', bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-100' },
  ceo:      { label: 'CEO',      bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100'  },
  vendor:   { label: 'Vendor',   bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200'   },
  user:     { label: 'User',     bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200'   },
};

const STATUS_CONFIG = {
  approved: { label: 'Active',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-100',    dot: 'bg-rose-500'    },
  pending:  { label: 'Pending',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100',   dot: 'bg-amber-500'   },
};

/* ── Assign Vendor Modal ── */
const AssignVendorModal = ({ open, onClose, user, vendors, onAssign }) => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setSelectedVendor(user?.vendorName || ''); setSearch(''); }
  }, [open, user]);

  if (!open || !user) return null;

  const filtered = vendors.filter(v => v.vendorName?.toLowerCase().includes(search.toLowerCase()));

  const handleAssign = async () => {
    if (!selectedVendor) {
      Swal.fire({ icon: 'warning', title: 'Vendor select করো', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false });
      return;
    }
    setSaving(true);
    await onAssign(user._id, selectedVendor);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Assign Vendor</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{user.displayName} — {user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-500">এই user কোন vendor এর সাথে link করবে সেটা select করো।</p>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            placeholder="Vendor search করো…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-44 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1">
            {filtered.length === 0
              ? <p className="text-xs text-gray-400 text-center py-4">No vendors found</p>
              : filtered.map(v => (
                <button key={v._id} onClick={() => setSelectedVendor(v.vendorName)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between
                    ${selectedVendor === v.vendorName ? 'bg-teal-600 text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                  <span className="font-medium">{v.vendorName}</span>
                  {selectedVendor === v.vendorName && <Check size={13} />}
                </button>
              ))
            }
          </div>
          {selectedVendor && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700 font-semibold">
              ✓ Selected: {selectedVendor}
            </div>
          )}
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handleAssign} disabled={saving || !selectedVendor}
            className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-500 transition disabled:opacity-60">
            {saving ? 'Saving…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Action dropdown (shared by table row + mobile card) ── */
const ActionDropdown = ({ user, onRole, onStatus, onDelete, onAssignVendor, onClose, alignLeft = false }) => (
  <div className={`absolute ${alignLeft ? 'left-0' : 'right-0'} mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden`}>
    <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/80">Status</p>
    <button onClick={() => onStatus(user._id, 'approved')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
      <UserCheck size={14} /> Approve User
    </button>
    <button onClick={() => onStatus(user._id, 'rejected')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border-b border-gray-100">
      <UserX size={14} /> Reject User
    </button>
    <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/80">Role</p>
    <button onClick={() => onRole(user._id, 'manager')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
      <ShieldCheck size={14} /> Make Manager
    </button>
    <button onClick={() => onRole(user._id, 'operator')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
      <UserPlus size={14} /> Make Operator
    </button>
    <button onClick={() => onRole(user._id, 'ceo')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border-b border-gray-100">
      <UserPlus size={14} /> Make CEO
    </button>
    <button onClick={() => { onClose(); onAssignVendor(user); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 transition-colors border-b border-gray-100">
      <UserPlus size={14} /> Make Vendor 🏢
    </button>
    <button onClick={() => onDelete(user._id, user.displayName)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-600 hover:text-white transition-colors mt-0.5">
      <Trash2 size={14} /> Delete Account
    </button>
  </div>
);

/* ── Mobile user card ── */
const UserCard = ({ user, loadingId, openDropdownId, setOpenDropdownId, onRole, onStatus, onDelete, onAssignVendor }) => {
  const roleConf   = ROLE_CONFIG[user.role]     || ROLE_CONFIG.user;
  const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.pending;
  const isLoading  = loadingId === user._id;
  const isOpen     = openDropdownId === user._id;
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenDropdownId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-3 shadow-sm transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative shrink-0">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
              alt=""
              className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm object-cover"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`; }}
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusConf.dot}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName}</p>
            <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Action button */}
        <div className="relative shrink-0" ref={ref}>
          <button
            onClick={() => setOpenDropdownId(isOpen ? null : user._id)}
            disabled={isLoading}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>
          {isOpen && (
            <ActionDropdown
              user={user}
              onRole={onRole}
              onStatus={onStatus}
              onDelete={onDelete}
              onAssignVendor={onAssignVendor}
              onClose={() => setOpenDropdownId(null)}
              alignLeft={false}
            />
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${roleConf.bg} ${roleConf.text} ${roleConf.border}`}>
          {roleConf.label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
          {statusConf.label}
        </span>
        {user.role === 'vendor' && user.vendorName && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            🏢 {user.vendorName}
          </span>
        )}
        {user.role === 'vendor' && !user.vendorName && (
          <span className="text-[11px] text-red-400 italic">Not linked</span>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const UserManagement = () => {
  const axiosSecure  = useAxiosSecure();
  const queryClient  = useQueryClient();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchText,     setSearchText]     = useState('');
  const [loadingId,      setLoadingId]      = useState(null);
  const [assignVendorUser, setAssignVendorUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdownId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: users = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: async () => { const res = await axiosSecure.get('/users'); return res.data; },
    staleTime: 60 * 1000,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors-list'],
    queryFn: async () => { const res = await axiosSecure.get('/vendors'); return res.data; },
    staleTime: 5 * 60 * 1000,
  });

  const filteredUsers = users.filter((u) => {
    const s = searchText.toLowerCase();
    return !searchText || u.displayName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.role?.toLowerCase().includes(s);
  });

  const stats = {
    total:    users.length,
    approved: users.filter(u => u.status === 'approved').length,
    pending:  users.filter(u => u.status === 'pending').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  };

  const toastSuccess = (msg) => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: msg, showConfirmButton: false, timer: 2000 });

  const handleRole = async (id, role) => {
    setLoadingId(id);
    try {
      await axiosSecure.patch(`/users/role/${id}`, { role });
      toastSuccess(`Role changed to ${role}`);
      setOpenDropdownId(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch { Swal.fire('Error!', 'Role update failed', 'error'); }
    finally { setLoadingId(null); }
  };

  const handleAssignVendor = async (id, vendorName) => {
    try {
      await axiosSecure.patch(`/users/role/${id}`, { role: 'vendor', vendorName });
      toastSuccess(`Vendor assigned: ${vendorName}`);
      setOpenDropdownId(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch { Swal.fire('Error!', 'Vendor assignment failed', 'error'); }
  };

  const handleStatus = async (id, status) => {
    setLoadingId(id);
    try {
      await axiosSecure.patch(`/users/status/${id}`, { status });
      toastSuccess(`Status changed to ${status}`);
      setOpenDropdownId(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch { Swal.fire('Error!', 'Status update failed', 'error'); }
    finally { setLoadingId(null); }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      html: `<p class="text-sm text-gray-500">This will permanently delete <b>${name}</b>.</p>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, delete',
    });
    if (result.isConfirmed) {
      setLoadingId(id);
      try {
        await axiosSecure.delete(`/users/${id}`);
        toastSuccess('User deleted');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } catch { Swal.fire('Error!', 'Delete failed', 'error'); }
      finally { setLoadingId(null); }
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
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <AssignVendorModal
        open={!!assignVendorUser}
        onClose={() => setAssignVendorUser(null)}
        user={assignVendorUser}
        vendors={vendors}
        onAssign={handleAssignVendor}
      />

      <div className="max-w-7xl mx-auto space-y-4">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Users size={20} className="text-indigo-600 shrink-0" /> User Management
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage roles, status, and permissions</p>
          </div>
          <button
            onClick={() => refetch()} disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 self-start sm:self-auto">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total',    value: stats.total,    color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
            { label: 'Active',   value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending',  value: stats.pending,  color: 'text-amber-600',   bg: 'bg-amber-50'   },
            { label: 'Rejected', value: stats.rejected, color: 'text-rose-600',    bg: 'bg-rose-50'    },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 sm:p-4 border border-white`}>
              <p className="text-[11px] sm:text-xs font-medium text-gray-500">{s.label}</p>
              <p className={`text-xl sm:text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>

        {/* ── Empty ── */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-16 text-gray-400 italic text-sm bg-white rounded-xl border border-gray-200">
            {searchText ? `No users found matching "${searchText}"` : 'No users found'}
          </div>
        )}

        {/* ════ MOBILE: Card list ════ */}
        {isMobile && filteredUsers.length > 0 && (
          <div className="space-y-2.5">
            {filteredUsers.map(user => (
              <UserCard
                key={user._id}
                user={user}
                loadingId={loadingId}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
                onRole={handleRole}
                onStatus={handleStatus}
                onDelete={handleDelete}
                onAssignVendor={setAssignVendorUser}
              />
            ))}
          </div>
        )}

        {/* ════ DESKTOP / LAPTOP: Table ════ */}
        {!isMobile && filteredUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['User', 'Role', 'Status', 'Vendor Link', 'Actions'].map(h => (
                      <th key={h} className="px-4 lg:px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(user => {
                    const roleConf   = ROLE_CONFIG[user.role]     || ROLE_CONFIG.user;
                    const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.pending;
                    const isLoading  = loadingId === user._id;

                    return (
                      <tr key={user._id} className={`hover:bg-gray-50/50 transition-colors ${isLoading ? 'opacity-50' : ''}`}>

                        {/* User */}
                        <td className="px-4 lg:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
                                alt=""
                                className="h-9 w-9 rounded-full ring-2 ring-white shadow-sm object-cover"
                                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`; }}
                              />
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusConf.dot}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px] lg:max-w-none">{user.displayName}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[140px] lg:max-w-none">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 lg:px-6 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border capitalize ${roleConf.bg} ${roleConf.text} ${roleConf.border}`}>
                            {roleConf.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 lg:px-6 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                            {statusConf.label}
                          </span>
                        </td>

                        {/* Vendor link */}
                        <td className="px-4 lg:px-6 py-3">
                          {user.role === 'vendor' && user.vendorName ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                              🏢 {user.vendorName}
                            </span>
                          ) : user.role === 'vendor' ? (
                            <span className="text-xs text-red-400 italic">Not linked</span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 lg:px-6 py-3 text-right relative" ref={openDropdownId === user._id ? dropdownRef : null}>
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === user._id ? null : user._id)}
                            disabled={isLoading}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-40"
                          >
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>
                          {openDropdownId === user._id && (
                            <ActionDropdown
                              user={user}
                              onRole={handleRole}
                              onStatus={handleStatus}
                              onDelete={handleDelete}
                              onAssignVendor={setAssignVendorUser}
                              onClose={() => setOpenDropdownId(null)}
                              alignLeft={false}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;