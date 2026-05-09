import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import S from "../Component/SuspenseWrapper";
const SuccessPage = lazy(() => import("../Component/SuccessPage"));
const CarRentPage = lazy(() => import("../Pages/BillPage"));
const VendorTripSummary = lazy(() => import("../Pages/VendorTripSummary"));
const AccountsDashboard = lazy(() => import("../Pages/AccountsDashboard"));
const BillTracker = lazy(() => import("../Pages/BillTracker"));
const LaborBillPage = lazy(() => import("../Pages/LaborBillPage"));

const Home = lazy(() => import("../Pages/Home"));
const Login = lazy(() => import("../Pages/Login"));
const Register = lazy(() => import("../Pages/Register"));
const Profile = lazy(() => import("../Pages/Profile"));
const UserManagement = lazy(() => import("../Pages/UserManagement"));
const AddGatePass = lazy(() => import("../Pages/AddGatePass"));
const AllGatePass = lazy(() => import("../Pages/AllGatePass"));
const AddChallan = lazy(() => import("../Pages/AddChallan"));
const AllChallan = lazy(() => import("../Pages/AllChallan"));
const AddVendor = lazy(() => import("../Pages/AddVendor"));
const AllVendor = lazy(() => import("../Pages/AllVendor"));
const VendorDetails = lazy(() => import("../Pages/VendorDetails"));
const CreateDelivery = lazy(() => import("../Pages/CreateDelivery"));
const DeliveredPage = lazy(() => import("../Pages/Deliverd"));
const TripInventory = lazy(() => import("../Pages/TripInventoryPage"));

// Vendor শুধু এই ৩টায় যেতে পারবে
const VENDOR_ALLOWED = ["vendor", "admin", "manager", "operator", "ceo", "user"];
// Vendor এই routes গুলোতে যেতে পারবে না
const NON_VENDOR = ["admin", "manager", "operator", "ceo", "user"];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      // Public
      { index: true, path: "/", 
        element: <PrivateRoute><S><Home /></S></PrivateRoute> },
      { path: "/register", element: <S><Register /></S> },
      { path: "/login", element: <S><Login /></S> },
      { path: "/profile", element: <S><Profile /></S> },

      // ── Vendor-allowed routes (vendor + all other roles) ──
      {
        path: "/all-vendor",
        element: <PrivateRoute><RoleRoute roles={VENDOR_ALLOWED}><S><AllVendor /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/vendor-details/:id",
        element: <PrivateRoute><RoleRoute roles={VENDOR_ALLOWED}><S><VendorDetails /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/vendor-trip-summary/:id",
        element: <PrivateRoute><RoleRoute roles={VENDOR_ALLOWED}><S><VendorTripSummary /></S></RoleRoute></PrivateRoute>,
      },

      // ── Non-vendor routes (vendor ঢুকতে পারবে না) ──
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
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "operator","ceo"]}><S><AllGatePass /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/add-challan",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "operator"]}><S><AddChallan /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/all-challan",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "operator","ceo"]}><S><AllChallan /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/add-vendor",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "operator"]}><S><AddVendor /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/create-delivery",
        element: <PrivateRoute><RoleRoute roles={NON_VENDOR}><S><CreateDelivery /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/deliverd",
        element: <PrivateRoute><RoleRoute roles={NON_VENDOR}><S><DeliveredPage /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/trip-inventory",
        element: <PrivateRoute><RoleRoute roles={NON_VENDOR}><S><TripInventory /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/car-rent",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "ceo"]}><S><CarRentPage /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/accounts",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "ceo"]}><S><AccountsDashboard /></S></RoleRoute></PrivateRoute>,
      },
      {
        path: "/walton-bills",
        element: <PrivateRoute><RoleRoute roles={["admin", "manager", "ceo"]}><S><BillTracker /></S></RoleRoute></PrivateRoute>,
      },
       { path: "/registration-success", element: <S><SuccessPage /></S> },
       {
  path: "/labor-bill",
  element: <PrivateRoute><RoleRoute roles={["admin", "manager", "ceo","operator"]}><S><LaborBillPage /></S></RoleRoute></PrivateRoute>,
}
    ],
  },
]);