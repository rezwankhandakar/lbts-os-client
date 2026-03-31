import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

const Home = lazy(() => import("../Pages/Home"));
const Register = lazy(() => import("../Pages/Register"));
const Login = lazy(() => import("../Pages/Login"));
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
const TripInventoryPage = lazy(() => import("../Pages/TripInventoryPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
  </div>
);

const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
      {
        path: "/register",
        element: withSuspense(Register),
      },
      {
        path: "/login",
        element: withSuspense(Login),
      },
      {
        path: "/profile",
        element: withSuspense(Profile),
      },
      {
        path: "/user-management",
        element: (
          <PrivateRoute>
            <RoleRoute roles={['admin']}>
              <Suspense fallback={<PageLoader />}>
                <UserManagement />
              </Suspense>
            </RoleRoute>
          </PrivateRoute>
        ),
      },
      {
        path: '/add-gate-pass',
        element: (
          <PrivateRoute>
            <RoleRoute roles={['admin', 'manager', 'operator']}>
              <Suspense fallback={<PageLoader />}>
                <AddGatePass />
              </Suspense>
            </RoleRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "/all-gate-pass",
        element: (
          <PrivateRoute>
            <RoleRoute roles={['admin', 'manager', 'operator']}>
              <Suspense fallback={<PageLoader />}>
                <AllGatePass />
              </Suspense>
            </RoleRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "/add-challan",
        element: withSuspense(AddChallan),
      },
      {
        path: "/all-challan",
        element: withSuspense(AllChallan),
      },
      {
        path: "/add-vendor",
        element: withSuspense(AddVendor),
      },
      {
        path: "/all-vendor",
        element: withSuspense(AllVendor),
      },
      {
        path: "/vendor-details/:id",
        element: withSuspense(VendorDetails),
      },
      {
        path: "/create-delivery",
        element: withSuspense(CreateDelivery),
      },
      {
        path: "/deliverd",
        element: withSuspense(DeliveredPage),
      },
      {
        path: "/trip-inventory",
        element: withSuspense(TripInventoryPage),
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);
