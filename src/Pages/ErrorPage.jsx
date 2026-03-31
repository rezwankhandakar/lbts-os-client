import { useNavigate, useRouteError } from 'react-router';

const ErrorPage = () => {
  const navigate = useNavigate();
  const error = useRouteError();

  const is404 = error?.status === 404;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-black text-orange-500">
            {is404 ? '404' : '!'}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
          {is404 ? 'Page Not Found' : 'Something Went Wrong'}
        </h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          {is404
            ? "The page you're looking for doesn't exist or has been moved."
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline btn-sm px-5"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary btn-sm px-5"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
