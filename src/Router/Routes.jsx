
import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import S from "../Component/SuspenseWrapper"; // ← PageLoader সরিয়ে S import করো
import CarRentPage from "../Pages/BillPage";
import VendorTripSummary from "../Pages/VendorTripSummary";
import AccountsDashboard from "../Pages/AccountsDashboard";

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
      { path: "/vendor-trip-summary/:id", element: <S><VendorTripSummary /></S> },
      { path: "/create-delivery", element: <S><CreateDelivery /></S> },
      { path: "/deliverd", element: <S><DeliveredPage /></S> },
      { path: "/trip-inventory", element: <S><TripInventory /></S> },
      { path: "/car-rent", element: <S><CarRentPage></CarRentPage></S> },
      { path: "/accounts", element: <S><AccountsDashboard></AccountsDashboard></S> },
    ],
  },
]);