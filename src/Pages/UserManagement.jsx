// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import useAxiosSecure from '../hooks/useAxiosSecure';
// import Swal from 'sweetalert2';

// const UserManagement = () => {
//   const axiosSecure = useAxiosSecure();
//   const [openDropdownId, setOpenDropdownId] = useState(null);

//   const { data: users = [], isLoading, error, refetch } = useQuery({
//     queryKey: ['users'],
//     queryFn: async () => {
//       const res = await axiosSecure.get('/users');
//       return res.data;
//     },
//   });

// const handleRole = async (id, role) => {
//   try {
//     await axiosSecure.patch(`/users/role/${id}`, { role });

//     Swal.fire({
//       icon: "success",
//       title: "Role Updated",
//       text: `User role changed to ${role}`,
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     setOpenDropdownId(null);
//     refetch();
//   } catch (err) {
//     Swal.fire("Error!", "Role update failed", "error");
//   }
// };

// const handleStatus = async (id, status) => {
//   try {
//     await axiosSecure.patch(`/users/status/${id}`, { status });

//     Swal.fire({
//       icon: "success",
//       title: "Status Updated",
//       text: `User status changed to ${status}`,
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     setOpenDropdownId(null);
//     refetch();
//   } catch (err) {
//     Swal.fire("Error!", "Status update failed", "error");
//   }
// };

// const handleDelete = async (id) => {
//   Swal.fire({
//     title: "Are you sure?",
//     text: "This user will be deleted permanently!",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#16a34a",
//     cancelButtonColor: "#d33",
//     confirmButtonText: "Yes, delete",
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//       try {
//         await axiosSecure.delete(`/users/${id}`);

//         Swal.fire({
//           icon: "success",
//           title: "Deleted!",
//           text: "User deleted successfully",
//           timer: 1500,
//           showConfirmButton: false,
//         });

//         setOpenDropdownId(null);
//         refetch();
//       } catch (err) {
//         Swal.fire("Error!", "Delete failed", "error");
//       }
//     }
//   });
// };

//   if (isLoading) return <p className="text-center mt-10 text-gray-500">Loading users...</p>;
//   if (error) return <p className="text-center mt-10 text-red-500">Failed to load users</p>;

//   return (
//     <div className="p-4 md:p-6  min-h-screen">
//       <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">User Management</h2>

//       {/* Responsive container */}
//       <div className="overflow-x-auto w-full shadow-lg rounded-lg bg-white">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">SL</th>
//               <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Photo</th>
//               <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Name</th>
//               <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Email</th>
//               <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Status</th>
//               <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Role</th>
//               <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Action</th>
//             </tr>
//           </thead>

//           <tbody className="bg-white divide-y divide-gray-200">
//             {users.map((user, index) => (
//               <tr key={user._id} className="hover:bg-gray-50 transition">
//                 <td className="px-2 py-2 text-xs sm:text-sm">{index + 1}</td>

//                 <td className="px-2 py-2">
//                   <img
//                     src={user.photoURL}
//                     alt={user.displayName}
//                     className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
//                   />
//                 </td>

//                 <td className="px-2 py-2 text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[80px] sm:max-w-[150px]">
//                   {user.displayName}
//                 </td>

//                 <td className="px-2 py-2 text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-[200px]">
//                   {user.email}
//                 </td>

//                 {/* Status */}
//                 <td className="px-2 py-2">
//                   {user.status === 'approved' ? (
//                     <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
//                       Approved
//                     </span>
//                   ) : user.status === 'rejected' ? (
//                     <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
//                       Rejected
//                     </span>
//                   ) : (
//                     <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
//                       Pending
//                     </span>
//                   )}
//                 </td>

//                 {/* Role */}
//                 <td className="px-2 py-2">
//                   <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
//                     {user.role || 'User'}
//                   </span>
//                 </td>

//                 {/* Action Dropdown */}
//                 <td className="px-2 py-2 relative">
//                   <button
//                     onClick={() =>
//                       setOpenDropdownId(openDropdownId === user._id ? null : user._id)
//                     }
//                     className="inline-flex justify-center w-full px-2 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
//                   >
//                     Actions
//                     <svg
//                       className="ml-1 h-3 sm:h-4 w-3 sm:w-4"
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                       aria-hidden="true"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </button>

//                   {openDropdownId === user._id && (
//                     <ul className="absolute right-0 mt-2 w-36 sm:w-44 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
//                       <li
//                         className="px-3 py-1 hover:bg-green-50 cursor-pointer text-green-600 text-xs sm:text-sm"
//                         onClick={() => handleStatus(user._id, 'approved')}
//                       >
//                         Approve
//                       </li>
//                       <li
//                         className="px-3 py-1 hover:bg-red-50 cursor-pointer text-red-600 text-xs sm:text-sm"
//                         onClick={() => handleStatus(user._id, 'rejected')}
//                       >
//                         Reject
//                       </li>
//                       <li
//                         className="px-3 py-1 hover:bg-blue-50 cursor-pointer text-blue-600 text-xs sm:text-sm"
//                         onClick={() => handleRole(user._id, 'manager')}
//                       >
//                         Make Manager
//                       </li>
//                       <li
//                         className="px-3 py-1 hover:bg-blue-50 cursor-pointer text-blue-600 text-xs sm:text-sm"
//                         onClick={() => handleRole(user._id, 'ceo')}
//                       >
//                         Make CEO
//                       </li>
//                       <li
//                         className="px-3 py-1 hover:bg-blue-50 cursor-pointer text-blue-600 text-xs sm:text-sm"
//                         onClick={() => handleRole(user._id, 'operator')}
//                       >
//                         Make Operator
//                       </li>
//                       <li
//                         className="px-3 py-1 hover:bg-red-50 cursor-pointer text-red-600 text-xs sm:text-sm"
//                         onClick={() => handleDelete(user._id)}
//                       >
//                         Delete
//                       </li>
//                     </ul>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default UserManagement;

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
