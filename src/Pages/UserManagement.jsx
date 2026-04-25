
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
  admin:    { label: 'Admin',    bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  manager:  { label: 'Manager',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'   },
  operator: { label: 'Operator', bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  ceo:      { label: 'CEO',      bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'  },
  vendor:   { label: 'Vendor',   bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200'   },
  user:     { label: 'User',     bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200'  },
};

const STATUS_CONFIG = {
  approved: { label: 'Active',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
  pending:  { label: 'Pending',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
};

/* ── Assign Vendor Modal ── */
const AssignVendorModal = ({ open, onClose, user, vendors, onAssign }) => {
  const [selectedVendor, setSelectedVendor] = useState('');
  const [search, setSearch]   = useState('');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (open) { setSelectedVendor(user?.vendorName || ''); setSearch(''); }
  }, [open, user]);

  if (!open || !user) return null;

  const filtered = vendors.filter(v => v.vendorName?.toLowerCase().includes(search.toLowerCase()));

  const handleAssign = async () => {
    if (!selectedVendor) {
      Swal.fire({ icon: 'warning', title: 'Select a vendor', toast: true, position: 'top-end', timer: 1800, showConfirmButton: false });
      return;
    }
    setSaving(true);
    await onAssign(user._id, selectedVendor);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-800">Assign Vendor</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
              {user.displayName} · {user.email}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500">Select the vendor to link with this user.</p>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 bg-slate-50"
              placeholder="Search vendors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-44 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-1.5 bg-slate-50">
            {filtered.length === 0
              ? <p className="text-xs text-slate-400 text-center py-4">No vendors found</p>
              : filtered.map(v => (
                <button key={v._id} onClick={() => setSelectedVendor(v.vendorName)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between font-medium ${
                    selectedVendor === v.vendorName ? 'bg-orange-500 text-white' : 'hover:bg-white text-slate-700'
                  }`}>
                  <span>{v.vendorName}</span>
                  {selectedVendor === v.vendorName && <Check size={13} />}
                </button>
              ))
            }
          </div>
          {selectedVendor && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700 font-semibold">
              ✓ Selected: {selectedVendor}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 font-semibold">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={saving || !selectedVendor}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-black transition disabled:opacity-60">
            {saving ? 'Saving…' : 'Assign Vendor'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Action dropdown ── */
const ActionMenu = ({ user, onRole, onStatus, onDelete, onAssignVendor, onClose, alignLeft = false }) => (
  <div className={`absolute ${alignLeft ? 'left-0' : 'right-0'} mt-1 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden`}>
    <p className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Status</p>
    <button onClick={() => onStatus(user._id, 'approved')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
      <UserCheck size={13} /> Approve User
    </button>
    <button onClick={() => onStatus(user._id, 'rejected')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors border-b border-slate-100">
      <UserX size={13} /> Reject User
    </button>
    <p className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Role</p>
    <button onClick={() => onRole(user._id, 'manager')}  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
      <ShieldCheck size={13} /> Make Manager
    </button>
    <button onClick={() => onRole(user._id, 'operator')} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
      <UserPlus size={13} /> Make Operator
    </button>
    <button onClick={() => onRole(user._id, 'ceo')}      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border-b border-slate-100">
      <UserPlus size={13} /> Make CEO
    </button>
    <button onClick={() => { onClose(); onAssignVendor(user); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 transition-colors border-b border-slate-100">
      <UserPlus size={13} /> Make Vendor 🏢
    </button>
    <button onClick={() => onDelete(user._id, user.displayName)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors">
      <Trash2 size={13} /> Delete Account
    </button>
  </div>
);

/* ── Mobile user card ── */
const UserCard = ({ user, loadingId, openDropdownId, setOpenDropdownId, onRole, onStatus, onDelete, onAssignVendor }) => {
  const roleConf   = ROLE_CONFIG[user.role]     || ROLE_CONFIG.user;
  const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.pending;
  const isLoading  = loadingId === user._id;
  const isOpen     = openDropdownId === user._id;
  const ref        = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpenDropdownId(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isOpen]);

  return (
    <div className={`bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
              alt=""
              className="w-10 h-10 rounded-xl ring-2 ring-white shadow-sm object-cover"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`; }}
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusConf.dot}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user.displayName}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <div className="relative flex-shrink-0" ref={ref}>
          <button
            onClick={() => setOpenDropdownId(isOpen ? null : user._id)}
            disabled={isLoading}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
          >
            <MoreVertical size={15} className="text-slate-500" />
          </button>
          {isOpen && (
            <ActionMenu user={user} onRole={onRole} onStatus={onStatus} onDelete={onDelete}
              onAssignVendor={onAssignVendor} onClose={() => setOpenDropdownId(null)} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${roleConf.bg} ${roleConf.text} ${roleConf.border}`}>
          {roleConf.label}
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
          {statusConf.label}
        </span>
        {user.role === 'vendor' && user.vendorName && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
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

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const UserManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [openDropdownId,   setOpenDropdownId]   = useState(null);
  const [searchText,       setSearchText]       = useState('');
  const [loadingId,        setLoadingId]        = useState(null);
  const [assignVendorUser, setAssignVendorUser] = useState(null);
  const [isMobile,         setIsMobile]         = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdownId(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
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

  const filteredUsers = users.filter(u => {
    const s = searchText.toLowerCase();
    return !searchText || u.displayName?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.role?.toLowerCase().includes(s);
  });

  const stats = {
    total:    users.length,
    approved: users.filter(u => u.status === 'approved').length,
    pending:  users.filter(u => u.status === 'pending').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  };

  const toast = (msg) => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: msg, showConfirmButton: false, timer: 2000 });

  const handleRole = async (id, role) => {
    setLoadingId(id);
    try {
      await axiosSecure.patch(`/users/role/${id}`, { role });
      toast(`Role changed to ${role}`);
      setOpenDropdownId(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch { Swal.fire('Error!', 'Role update failed', 'error'); }
    finally { setLoadingId(null); }
  };

  const handleAssignVendor = async (id, vendorName) => {
    try {
      await axiosSecure.patch(`/users/role/${id}`, { role: 'vendor', vendorName });
      toast(`Vendor assigned: ${vendorName}`);
      setOpenDropdownId(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch { Swal.fire('Error!', 'Vendor assignment failed', 'error'); }
  };

  const handleStatus = async (id, status) => {
    setLoadingId(id);
    try {
      await axiosSecure.patch(`/users/status/${id}`, { status });
      toast(`Status changed to ${status}`);
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
      confirmButtonColor: '#ef4444', cancelButtonColor: '#94a3b8', confirmButtonText: 'Yes, delete',
    });
    if (result.isConfirmed) {
      setLoadingId(id);
      try {
        await axiosSecure.delete(`/users/${id}`);
        toast('User deleted');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } catch { Swal.fire('Error!', 'Delete failed', 'error'); }
      finally { setLoadingId(null); }
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading users..." />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <p className="text-red-500 font-medium">Failed to load users</p>
      <button onClick={() => refetch()} className="text-sm text-orange-500 underline">Try again</button>
    </div>
  );

  return (
    <div className="space-y-4 page-enter">
      <AssignVendorModal
        open={!!assignVendorUser} onClose={() => setAssignVendorUser(null)}
        user={assignVendorUser} vendors={vendors} onAssign={handleAssignVendor}
      />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">User Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage roles, status, and permissions</p>
          </div>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 font-semibold">
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total Users', value: stats.total,    color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100'  },
          { label: 'Active',      value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Pending',     value: stats.pending,  color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
          { label: 'Rejected',    value: stats.rejected, color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100'     },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-3 sm:p-4`}>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
        />
      </div>

      {/* ── Empty ── */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
          {searchText ? `No users found matching "${searchText}"` : 'No users found'}
        </div>
      )}

      {/* ── Mobile cards ── */}
      {isMobile && filteredUsers.length > 0 && (
        <div className="space-y-2.5">
          {filteredUsers.map(user => (
            <UserCard key={user._id} user={user} loadingId={loadingId}
              openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
              onRole={handleRole} onStatus={handleStatus} onDelete={handleDelete}
              onAssignVendor={setAssignVendorUser} />
          ))}
        </div>
      )}

      {/* ── Desktop table ── */}
      {!isMobile && filteredUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '640px' }}>
              <thead>
                <tr className="bg-slate-900">
                  {['User', 'Role', 'Status', 'Vendor Link', 'Actions'].map(h => (
                    <th key={h} className="px-4 lg:px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => {
                  const roleConf   = ROLE_CONFIG[user.role]     || ROLE_CONFIG.user;
                  const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.pending;
                  const isLoad     = loadingId === user._id;

                  return (
                    <tr key={user._id} className={`hover:bg-slate-50/60 transition-colors ${isLoad ? 'opacity-50' : ''}`}>

                      {/* User */}
                      <td className="px-4 lg:px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`}
                              alt=""
                              className="w-9 h-9 rounded-xl ring-2 ring-white shadow-sm object-cover"
                              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`; }}
                            />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusConf.dot}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[160px]">{user.displayName}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 lg:px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${roleConf.bg} ${roleConf.text} ${roleConf.border}`}>
                          {roleConf.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 lg:px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="px-4 lg:px-5 py-3">
                        {user.role === 'vendor' && user.vendorName ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            🏢 {user.vendorName}
                          </span>
                        ) : user.role === 'vendor' ? (
                          <span className="text-xs text-red-400 italic font-medium">Not linked</span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 lg:px-5 py-3 text-right relative" ref={openDropdownId === user._id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === user._id ? null : user._id)}
                          disabled={isLoad}
                          className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
                        >
                          <MoreVertical size={15} className="text-slate-500" />
                        </button>
                        {openDropdownId === user._id && (
                          <ActionMenu user={user} onRole={handleRole} onStatus={handleStatus}
                            onDelete={handleDelete} onAssignVendor={setAssignVendorUser}
                            onClose={() => setOpenDropdownId(null)} />
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
  );
};

export default UserManagement;
