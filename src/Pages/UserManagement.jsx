import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { 
  MoreVertical, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Trash2, 
  UserPlus 
} from 'lucide-react';

const UserManagement = () => {
  const axiosSecure = useAxiosSecure();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users');
      return res.data;
    },
  });

  const handleRole = async (id, role) => {
    try {
      await axiosSecure.patch(`/users/role/${id}`, { role });
      toastSuccess(`Role changed to ${role}`);
      setOpenDropdownId(null);
      refetch();
    } catch (err) {
      Swal.fire("Error!", "Role update failed", "error");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axiosSecure.patch(`/users/status/${id}`, { status });
      toastSuccess(`Status changed to ${status}`);
      setOpenDropdownId(null);
      refetch();
    } catch (err) {
      Swal.fire("Error!", "Status update failed", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/users/${id}`);
          toastSuccess("User deleted successfully");
          refetch();
        } catch (err) {
          Swal.fire("Error!", "Delete failed", "error");
        }
      }
    });
  };

  const toastSuccess = (msg) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: msg,
      showConfirmButton: false,
      timer: 2000
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-indigo-600 font-medium animate-pulse">Loading secure user data...</div>;
  if (error) return <p className="text-center mt-10 text-red-500">Failed to load users</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h2>
            <p className="text-sm text-gray-500">Manage user roles, status, and permissions</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm font-medium text-gray-600">
            Total Users: <span className="text-indigo-600">{users.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.photoURL}
                          alt=""
                          className="h-10 w-10 rounded-full ring-2 ring-white shadow-sm object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.displayName}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                        {user.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'approved' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      ) : user.status === 'rejected' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right relative" ref={openDropdownId === user._id ? dropdownRef : null}>
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === user._id ? null : user._id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-block"
                      >
                        <MoreVertical size={18} className="text-gray-500" />
                      </button>

                      {openDropdownId === user._id && (
                        <div className="absolute right-6 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
                          <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">Manage Status</p>
                          <button onClick={() => handleStatus(user._id, 'approved')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">
                            <UserCheck size={16} /> Approve User
                          </button>
                          <button onClick={() => handleStatus(user._id, 'rejected')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700 border-b">
                            <UserX size={16} /> Reject User
                          </button>

                          <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50">Assign Role</p>
                          <button onClick={() => handleRole(user._id, 'manager')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                            <ShieldCheck size={16} /> Make Manager
                          </button>
                          <button onClick={() => handleRole(user._id, 'ceo')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                            <UserPlus size={16} /> Make CEO
                          </button>
                          
                          <div className="border-t mt-1">
                            <button onClick={() => handleDelete(user._id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-600 hover:text-white transition-colors">
                              <Trash2 size={16} /> Delete Account
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
