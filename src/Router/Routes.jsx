// import { createBrowserRouter } from "react-router";
// import RootLayout from "../Layout/RootLayout";
// import ErrorPage from "../Pages/ErrorPage";
// import Home from "../Pages/Home";
// import Register from "../Pages/Register";
// import Login from "../Pages/Login";
// import Profile from "../Pages/Profile";
// import UserManagement from "../Pages/UserManagement";
// import PrivateRoute from "./PrivateRoute";
// import AddGatePass from "../Pages/AddGatePass";
// import AllGatePass from "../Pages/AllGatePass";
// import RoleRoute from "./RoleRoute";
// import AddChallan from "../Pages/AddChallan";
// import AllChallan from "../Pages/AllChallan";
// import AddVendor from "../Pages/AddVendor";
// import AllVendor from "../Pages/AllVendor";
// import VendorDetails from "../Pages/VendorDetails";
// import CreateDelivery from "../Pages/CreateDelivery";
// import DeliveredPage from "../Pages/Deliverd";
// import TripInventoryPage from "../Pages/TripInventoryPage";

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     Component: RootLayout,
//     errorElement: <ErrorPage></ErrorPage>,
//     children: [
//       {
//         index: true,
//         path: "/",
//         Component: Home,
//       },
//       {
//         path: "/register",
//         Component: Register
//       },
//       {
//         path: "/login",
//         Component: Login
//       },
//       {
//         path: "/profile",
//         Component: Profile
//       },
//       {
//         path: "/user-management",
//         element: <PrivateRoute><RoleRoute roles={['admin']}><UserManagement></UserManagement></RoleRoute></PrivateRoute>
//       },
//       {
//         path: '/add-gate-pass',
//         element: <PrivateRoute><RoleRoute roles={['admin', 'manager', 'operator']}><AddGatePass></AddGatePass></RoleRoute></PrivateRoute>
//       },
//       {
//         path: "/all-gate-pass",
//         element: <PrivateRoute><RoleRoute roles={['admin', 'manager', 'operator']}><AllGatePass></AllGatePass></RoleRoute></PrivateRoute>
//       },
//       {
//         path: "/add-challan",
//         Component: AddChallan
//       },
//       {
//         path: "/all-challan",
//         Component: AllChallan
//       },
//       {
//         path: "/add-vendor",
//         Component: AddVendor
//       },
//       {
//         path: "/all-vendor",
//         Component: AllVendor
//       },
//       {
//         path: "/vendor-details/:id",
//         element: <VendorDetails></VendorDetails>
//       },
//       {
//         path: "/create-delivery",
//         Component: CreateDelivery
//       },
//       {
//         path: "/deliverd",
//         Component: DeliveredPage
//       },
//       {
//         path: "/trip-inventory",
//         Component: TripInventoryPage
//       }
    
//     ]

//   },
// ]);


import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import S from "../Component/SuspenseWrapper"; // ← PageLoader সরিয়ে S import করো

const Home           = lazy(() => import("../Pages/Home"));
const Login          = lazy(() => import("../Pages/Login"));
const Register       = lazy(() => import("../Pages/Register"));
const Profile        = lazy(() => import("../Pages/Profile"));
const UserManagement = lazy(() => import("../Pages/UserManagement"));
const AddGatePass    = lazy(() => import("../Pages/AddGatePass"));
const AllGatePass    = lazy(() => import("../Pages/AllGatePass"));
const AddChallan     = lazy(() => import("../Pages/AddChallan"));
const AllChallan     = lazy(() => import("../Pages/AllChallan"));
const AddVendor      = lazy(() => import("../Pages/AddVendor"));
const AllVendor      = lazy(() => import("../Pages/AllVendor"));
const VendorDetails  = lazy(() => import("../Pages/VendorDetails"));
const CreateDelivery = lazy(() => import("../Pages/CreateDelivery"));
const DeliveredPage  = lazy(() => import("../Pages/Deliverd"));
const TripInventory  = lazy(() => import("../Pages/TripInventoryPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      { index: true, path: "/", element: <S><Home /></S> },
      { path: "/register", element: <S><Register /></S> },
      { path: "/login", element: <S><Login /></S> },
      { path: "/profile", element: <S><Profile /></S> },
      {
        path: "/user-management",
        element: <PrivateRoute><RoleRoute roles={["admin"]}><S><UserManagement /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/add-gate-pass",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "operator"]}><S><AddGatePass /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/all-gate-pass",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "operator"]}><S><AllGatePass /></S></RoleRoute></PrivateRoute>,
      },
      { path: "/add-challan", element: <S><AddChallan /></S> },
      { path: "/all-challan", element: <S><AllChallan /></S> },
      { path: "/add-vendor", element: <S><AddVendor /></S> },
      { path: "/all-vendor", element: <S><AllVendor /></S> },
      { path: "/vendor-details/:id", element: <S><VendorDetails /></S> },
      { path: "/create-delivery", element: <S><CreateDelivery /></S> },
      { path: "/deliverd", element: <S><DeliveredPage /></S> },
      { path: "/trip-inventory", element: <S><TripInventory /></S> },
    ],
  },
]);