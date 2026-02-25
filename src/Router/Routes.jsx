import { createBrowserRouter } from "react-router";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import Home from "../Pages/Home";
import Register from "../Pages/Register";
import Login from "../Pages/Login";
import Profile from "../Pages/Profile";
import UserManagement from "../Pages/UserManagement";
import PrivateRoute from "./PrivateRoute";
import AddGatePass from "../Pages/AddGatePass";
import AllGatePass from "../Pages/AllGatePass";
import RoleRoute from "./RoleRoute";

 
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
        {
            index: true,
            path: "/",
            Component: Home ,
        },
        {
          path: "/register",
          Component: Register
        },
        {
          path: "/login",
          Component: Login
        },
        {
          path: "/profile",
          Component: Profile
        },
        {
          path: "/user-management",
          element: <PrivateRoute><RoleRoute roles={['admin']}><UserManagement></UserManagement></RoleRoute></PrivateRoute>
        },
        {
          path: '/add-gate-pass',
          element: <PrivateRoute><RoleRoute roles={['admin','manager','operator']}><AddGatePass></AddGatePass></RoleRoute></PrivateRoute>
        },
        {
          path: "/all-gate-pass",
          element: <PrivateRoute><RoleRoute roles={['admin','manager','operator']}><AllGatePass></AllGatePass></RoleRoute></PrivateRoute>
        }
    ]
   
  },
]);