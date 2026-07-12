import React, { useState, useRef, useEffect } from "react";
import { CgPlayButtonR } from "react-icons/cg";
import EditChallanModal from "./EditChallanModal";
import Swal from "sweetalert2";

const ChallanActionDropdown = ({ challan, product, axiosSecure, refetchChallans }) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const ref = useRef(null);

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/challan/${challan._id}`)
          .then(() => {
            if (typeof refetchChallans === "function") {
              refetchChallans();
            }
            Swal.fire({
              title: "Deleted!",
              text: "Challan has been deleted.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            console.error(err);
            // Server-এর কারণটা দেখানো (যেমন: dispatched challan delete করা যায় না)
            Swal.fire("Error!", err?.response?.data?.message || "Delete failed.", "error");
          });
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button onClick={() => setOpen(!open)} className="">
        <CgPlayButtonR className={`text-blue-500 transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`} size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <button 
            onClick={() => { setEditOpen(true); setOpen(false); }} 
            className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors"
          >
            ✏️ Edit
          </button>
          <button 
            onClick={handleDelete} 
            className="w-full text-left px-3 py-2 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors"
          >
            🗑️ Delete
          </button>
          <div className="bg-slate-50 px-3 py-1.5 italic text-[10px] text-slate-400 border-t border-slate-100">
            User: {challan.currentUser || "Admin"}
          </div>
        </div>
      )}

      <EditChallanModal 
        open={editOpen} onClose={() => setEditOpen(false)} 
        challan={challan} product={product} 
        axiosSecure={axiosSecure} refetchChallans={refetchChallans} 
      />
    </div>
  );
};

export default ChallanActionDropdown;