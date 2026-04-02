import { Suspense } from "react";
import PageLoader from "./PageLoader";


const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

export default SuspenseWrapper;