import { useRouteError, Link } from 'react-router';

const ErrorPage = () => {
  const error = useRouteError();
  const status = error?.status || 404;
  const message = error?.statusText || error?.message || 'Page Not Found';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-8xl font-bold text-gray-200">{status}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">{message}</h2>
        <p className="text-gray-500 mt-2">
          The page you are looking for does not exist or an error occurred.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
