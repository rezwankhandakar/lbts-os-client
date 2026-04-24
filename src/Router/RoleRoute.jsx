import React from "react";
import Forbidden from "../Component/Forbidden";
import useRole from "../hooks/useRole";

const RoleRoute = ({ roles, children }) => {
  const { role, status, isLoading, isError } = useRole();

  // Fetching role from server
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  // Network/server error — show Forbidden, not infinite spinner
  if (isError) return <Forbidden />;

  // Not logged in or no role assigned
  if (!role || !status) return <Forbidden />;

  // Role allowed and approved
  if (status === "approved" && roles.includes(role)) {
    return children;
  }

  // Access denied
  return <Forbidden />;
};

export default RoleRoute;