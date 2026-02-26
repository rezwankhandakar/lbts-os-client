
import React from "react";
import Forbidden from "../Component/Forbidden";
import useRole from "../hooks/useRole";

const RoleRoute = ({ roles, children }) => {
  const { role, status } = useRole();

  // ✅ Loading / fetching role
  if (status === "loading" || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="border-8 border-t-8 border-gray-200 border-t-green-500 rounded-full w-16 h-16 mb-4 animate-spin"></div>
          <span className="text-gray-700 font-medium text-lg">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // ✅ Role approved and included in allowed roles
  if (status === "approved" && roles.includes(role)) {
    return children;
  }

  // ❌ Access denied
  return <Forbidden />;
};

export default RoleRoute;