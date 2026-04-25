
const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center py-20">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-11 h-11">
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
        <div className="absolute inset-0 rounded-full border-[3px] border-t-orange-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-orange-500/10" />
      </div>
      <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;
