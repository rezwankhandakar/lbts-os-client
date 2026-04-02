const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center py-16">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500 font-medium">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;