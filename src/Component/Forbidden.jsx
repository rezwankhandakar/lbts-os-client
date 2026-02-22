import React from 'react';
import { Link } from 'react-router';

const Forbidden = () => {
  return (
    <div className="flex min-h-screen items-center justify-center  px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Icon */}
          <div className="text-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M5.455 19h13.09c1.1 0 1.793-1.18 1.232-2.09L13.777 4.91c-.55-.91-1.86-.91-2.41 0L4.223 16.91c-.56.91.13 2.09 1.232 2.09z"
              />
            </svg>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-error">403 Forbidden</h2>
          <p className="text-gray-500 mt-2">
            You don’t have permission to access this page.
          </p>

          {/* Actions */}
          <div className="card-actions mt-6">
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
