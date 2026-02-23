import { createBrowserRouter } from "react-router";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import Home from "../Pages/Home";
import Register from "../Pages/Register";
import Login from "../Pages/Login";
import Profile from "../Pages/Profile";
import UserManagement from "../Pages/UserManagement";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AddGatePass from "../Pages/AddGatePass";
import AllGatePass from "../Pages/AllGatePass";

 
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
          element: <PrivateRoute><AdminRoute><UserManagement></UserManagement></AdminRoute></PrivateRoute>
        },
        {
          path: '/add-gate-pass',
          Component: AddGatePass
        },
        {
          path: "/all-gate-pass",
          Component: AllGatePass
        }
    ]
   
  },
]);