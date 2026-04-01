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
import AddChallan from "../Pages/AddChallan";
import AllChallan from "../Pages/AllChallan";
import AddVendor from "../Pages/AddVendor";
import AllVendor from "../Pages/AllVendor";
import VendorDetails from "../Pages/VendorDetails";
import CreateDelivery from "../Pages/CreateDelivery";
import DeliveredPage from "../Pages/Deliverd";
import TripInventoryPage from "../Pages/TripInventoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: "/",
        Component: Home,
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
        element: <PrivateRoute><RoleRoute roles={['admin']}><UserManagement /></RoleRoute></PrivateRoute>
      },
      {
        path: '/add-gate-pass',
        element: <PrivateRoute><RoleRoute roles={['admin', 'manager', 'operator']}><AddGatePass /></RoleRoute></PrivateRoute>
      },
      {
        path: "/all-gate-pass",
        element: <PrivateRoute><RoleRoute roles={['admin', 'manager', 'operator']}><AllGatePass /></RoleRoute></PrivateRoute>
      },
      {
        path: "/add-challan",
        Component: AddChallan
      },
      {
        path: "/all-challan",
        Component: AllChallan
      },
      {
        path: "/add-vendor",
        Component: AddVendor
      },
      {
        path: "/all-vendor",
        Component: AllVendor
      },
      {
        path: "/vendor-details/:id",
        element: <VendorDetails />
      },
      {
        path: "/create-delivery",
        Component: CreateDelivery
      },
      {
        path: "/deliverd",
        Component: DeliveredPage
      },
      {
        path: "/trip-inventory",
        Component: TripInventoryPage
      },
      {
        path: "*",
        element: <ErrorPage />
      }
    ]
  },
]);
