import { createBrowserRouter } from "react-router";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import Home from "../Pages/Home";
import Register from "../Pages/Register";
import Login from "../Pages/Login";
 
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
        }
    ]
   
  },
]);