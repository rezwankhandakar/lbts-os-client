
import React from "react";
import Forbidden from "../Component/Forbidden";
import useRole from "../hooks/useRole";

const RoleRoute = ({ roles, children }) => {
  const { role, status } = useRole();

  // ✅ Loading / fetching role
  if (!role || !status) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
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