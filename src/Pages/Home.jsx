import { useNavigate } from 'react-router';
import { FiFileText, FiPackage, FiTruck, FiUsers } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import useRole from '../hooks/useRole';

const shortcuts = [
  { label: 'Add Gate Pass', path: '/add-gate-pass', icon: FiPackage, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { label: 'Gate Pass Inventory', path: '/all-gate-pass', icon: FiFileText, color: 'bg-green-50 text-green-600 border-green-100' },
  { label: 'Add Challan', path: '/add-challan', icon: FiFileText, color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { label: 'Challan Inventory', path: '/all-challan', icon: FiFileText, color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  { label: 'Add Vendor', path: '/add-vendor', icon: FiUsers, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { label: 'Vendor Database', path: '/all-vendor', icon: FiUsers, color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { label: 'Create Delivery', path: '/create-delivery', icon: FiTruck, color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { label: 'Trip Inventory', path: '/trip-inventory', icon: FiTruck, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useRole();

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Welcome back, {user?.displayName || 'User'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          LBTS Operations System &mdash; <span className="font-semibold text-orange-500 uppercase">{role || 'Operator'}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {shortcuts.map(({ label, path, icon: Icon, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border ${color} hover:shadow-md transition-all duration-200 active:scale-95`}
          >
            <Icon size={28} />
            <span className="text-xs font-bold text-center leading-snug">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
