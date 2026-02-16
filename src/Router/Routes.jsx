import { createBrowserRouter } from "react-router";
import RootLayout from "../Layout/RootLayout";
import ErrorPage from "../Pages/ErrorPage";
import Home from "../Pages/Home";
 
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
        }
    ]
   
  },
]);