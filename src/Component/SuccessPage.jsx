import { FiCheckCircle, FiMail } from "react-icons/fi";
import { Link } from "react-router";

const SuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <FiCheckCircle size={36} className="text-emerald-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Registration Successful!</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            আপনার registration সফলভাবে সম্পন্ন হয়েছে। Login করার আগে আপনার mail টি verify করে নিন।
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
            <FiMail size={16} />
            Email Verify করার নিয়ম
          </div>
          <ol className="text-amber-700 text-sm space-y-1 list-decimal list-inside leading-relaxed">
            <li>আপনার email inbox বা <strong>Spam</strong> folder এ যান</li>
            <li><strong>noreply</strong> নামে একটি mail পাবেন</li>
            <li>সেই mail এর verify link এ click করুন</li>
            <li>Verify সম্পন্ন হলে login করুন</li>
          </ol>
        </div>

        <Link
          to="/login"
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600
            text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all"
        >
          Login Page এ যান
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;