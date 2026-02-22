import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../hooks/useAxiosSecure';

const UserManagement = () => {
  const axiosSecure = useAxiosSecure();
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users');
      return res.data;
    },
  });

  const handleRole = async (id, role) => {
    await axiosSecure.patch(`/users/role/${id}`, { role });
    setOpenDropdownId(null);
    refetch();
  };

  const handleStatus = async (id, status) => {
    await axiosSecure.patch(`/users/status/${id}`, { status });
    setOpenDropdownId(null);
    refetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    await axiosSecure.delete(`/users/${id}`);
    setOpenDropdownId(null);
    refetch();
  };

  if (isLoading) return <p className="text-center mt-10 text-gray-500">Loading users...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Failed to load users</p>;

  return (
    <div className="p-4 md:p-6  min-h-screen">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">User Management</h2>

      {/* Responsive container */}
      <div className="overflow-x-auto w-full shadow-lg rounded-lg bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">SL</th>
              <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Photo</th>
              <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Name</th>
              <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Email</th>
              <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Status</th>
              <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Role</th>
              <th className="px-2 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50 transition">
                <td className="px-2 py-2 text-xs sm:text-sm">{index + 1}</td>

                <td className="px-2 py-2">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
                  />
                </td>

                <td className="px-2 py-2 text-xs sm:text-sm font-medium text-gray-800 truncate max-w-[80px] sm:max-w-[150px]">
                  {user.displayName}
                </td>

                <td className="px-2 py-2 text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-[200px]">
                  {user.email}
                </td>

                {/* Status */}
                <td className="px-2 py-2">
                  {user.status === 'approved' ? (
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      Approved
                    </span>
                  ) : user.status === 'rejected' ? (
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                      Rejected
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                      Pending
                    </span>
                  )}
                </td>

                {/* Role */}
                <td className="px-2 py-2">
                  <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                    {user.role || 'User'}
                  </span>
                </td>

                {/* Action Dropdown */}
                <td className="px-2 py-2 relative">
                  <button
                    onClick={() =>
                      setOpenDropdownId(openDropdownId === user._id ? null : user._id)
                    }
                    className="inline-flex justify-center w-full px-2 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                  >
                    Actions
                    <svg
                      className="ml-1 h-3 sm:h-4 w-3 sm:w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {openDropdownId === user._id && (
                    <ul className="absolute right-0 mt-2 w-36 sm:w-44 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                      <li
                        className="px-3 py-1 hover:bg-green-50 cursor-pointer text-green-600 text-xs sm:text-sm"
                        onClick={() => handleStatus(user._id, 'approved')}
                      >
                        Approve
                      </li>
                      <li
                        className="px-3 py-1 hover:bg-red-50 cursor-pointer text-red-600 text-xs sm:text-sm"
                        onClick={() => handleStatus(user._id, 'rejected')}
                      >
                        Reject
                      </li>
                      <li
                        className="px-3 py-1 hover:bg-blue-50 cursor-pointer text-blue-600 text-xs sm:text-sm"
                        onClick={() => handleRole(user._id, 'manager')}
                      >
                        Make Manager
                      </li>
                      <li
                        className="px-3 py-1 hover:bg-blue-50 cursor-pointer text-blue-600 text-xs sm:text-sm"
                        onClick={() => handleRole(user._id, 'ceo')}
                      >
                        Make CEO
                      </li>
                      <li
                        className="px-3 py-1 hover:bg-blue-50 cursor-pointer text-blue-600 text-xs sm:text-sm"
                        onClick={() => handleRole(user._id, 'operator')}
                      >
                        Make Operator
                      </li>
                      <li
                        className="px-3 py-1 hover:bg-red-50 cursor-pointer text-red-600 text-xs sm:text-sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        Delete
                      </li>
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
