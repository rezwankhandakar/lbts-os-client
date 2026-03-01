import React, { useState, useRef, useEffect } from "react";
import { CgPlayButtonR } from "react-icons/cg";
import EditChallanModal from "./EditChallanModal";
import Swal from "sweetalert2";

const ChallanActionDropdown = ({ challan, product, axiosSecure, setChallans }) => {
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
        axiosSecure.delete(`/challan/${challan._id}`).then(() => {
          setChallans((prev) => prev.filter((c) => c._id !== challan._id));
          Swal.fire("Deleted!", "Challan has been deleted.", "success");
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
      <button onClick={() => setOpen(!open)} className="p-1">
        <CgPlayButtonR className={`text-blue-500 transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`} size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-lg z-50 overflow-hidden">
          <button 
            onClick={() => { setEditOpen(true); setOpen(false); }} 
            className="w-full text-left px-3 py-2 hover:bg-blue-500 hover:text-white flex items-center gap-2 text-sm"
          >
            ✏️ Edit
          </button>
          <button 
            onClick={handleDelete} 
            className="w-full text-left px-3 py-2 hover:bg-red-500 hover:text-white flex items-center gap-2 text-sm"
          >
            🗑️ Delete
          </button>
          <div className="bg-gray-100 px-3 py-1 italic text-[10px] text-gray-500 border-t">
            User: {challan.currentUser || "Admin"}
          </div>
        </div>
      )}

      <EditChallanModal 
        open={editOpen} onClose={() => setEditOpen(false)} 
        challan={challan} product={product} 
        axiosSecure={axiosSecure} setChallans={setChallans} 
      />
    </div>
  );
};

export default ChallanActionDropdown;