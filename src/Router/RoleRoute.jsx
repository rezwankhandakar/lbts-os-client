import { Navigate } from "react-router";

import Forbidden from "../Component/Forbidden";
import useRole from "../hooks/useRole";

const RoleRoute = ({ roles, children }) => {
  const { role, status } = useRole();

  if (status === "loading") return <p>Loading...</p>;

  if (roles.includes(role) && status === "approved") {
    return children;
  }

  return <Forbidden></Forbidden>;
};

export default RoleRoute;