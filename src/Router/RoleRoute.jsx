


import React from "react";
import Forbidden from "../Component/Forbidden";
import useRole from "../hooks/useRole";

const RoleRoute = ({ roles, children }) => {
  const { role, status } = useRole();

  // role এখনো fetch হয়নি — loading
  if (role === undefined || status === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  // login করা নেই (role null হলে)
  if (!role || !status) return <Forbidden />;

  // role allowed এবং approved
  if (status === "approved" && roles.includes(role)) {
    return children;
  }

  // access denied
  return <Forbidden />;
};

export default RoleRoute;