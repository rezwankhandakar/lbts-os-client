import React from 'react';
import useAuth from '../hooks/useAuth';
import useRole from '../hooks/useRole';
import Forbidden from '../Component/Forbidden';

const AdminRoute = ({ children }) => {
  const { loading } = useAuth();
  const { role, status, } = useRole();

  if (loading ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (role?.toLowerCase() !== 'admin' || status?.toLowerCase() !== 'approved') {
    return <Forbidden />;
  }

  return children;
};

export default AdminRoute;
