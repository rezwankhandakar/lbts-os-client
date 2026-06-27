import { useRouteError, isRouteErrorResponse, Link } from "react-router";

const ErrorPage = () => {
  const error = useRouteError();

  const is404 =
    isRouteErrorResponse(error) && error.status === 404;

  const statusCode = isRouteErrorResponse(error) ? error.status : null;

  const title = is404
    ? "Page Not Found"
    : statusCode
    ? `Error ${statusCode}`
    : "Something Went Wrong";

  const message = is404
    ? "The page you're looking for doesn't exist or has been moved."
    : isRouteErrorResponse(error)
    ? error.statusText || "An unexpected error occurred."
    : error?.message || "An unexpected error occurred. Please try again.";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          {is404 ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>

        {/* Text */}
        {is404 ? (
          <>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">404</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Page পাওয়া যাচ্ছে না</h2>
            <p className="text-gray-500 text-sm mb-6">
              এই page টা নেই অথবা সরিয়ে ফেলা হয়েছে।
            </p>
          </>
        ) : (
          <>
            {statusCode && (
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                Error {statusCode}
              </p>
            )}
            <h2 className="text-xl font-bold text-gray-800 mb-2">কিছু একটা সমস্যা হয়েছে</h2>
            <p className="text-gray-500 text-sm mb-6">
              {message}
            </p>
          </>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
          >
            Refresh করো
          </button>
          <Link
            to="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
          >
            Home এ যাও
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ErrorPage;