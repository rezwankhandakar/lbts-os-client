import React, { useState, useRef, useEffect } from "react";
import EditGatePassModal from "./EditGatePassModal";
import Swal from "sweetalert2";
import { CgPlayButtonR } from "react-icons/cg";


const ActionDropdown = ({ gp, p, axiosSecure, setGatePasses }) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false); // modal state
  const ref = useRef(null);

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure
          .delete(`/gate-pass/${gp._id}`)
          .then(() => {
            setGatePasses((prev) => prev.filter((g) => g._id !== gp._id));

            Swal.fire({
              title: "Deleted!",
              text: "Gate pass has been deleted.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("Error!", "Delete failed.", "error");
          });
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
    <button
  onClick={() => setOpen(prev => !prev)}
  className="flex items-center justify-center  py-0.5"
  style={{ minWidth: "60px" }}
>
  <CgPlayButtonR
    className={`text-blue-500 transition-transform duration-300 ${
      open ? "rotate-90" : "rotate-0"
    }`}
  />
</button>

      {open && (
        <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow-lg z-50">
          <button
            onClick={() => {
              setEditOpen(true);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-1 hover:bg-blue-500 hover:text-white flex items-center gap-1 text-sm"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-3 py-1 hover:bg-red-500 hover:text-white flex items-center gap-1 text-sm"
          >
            🗑️ Delete
          </button>

          
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 italic">
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">Assigned by:</p>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 uppercase">
          {gp.currentUser?.charAt(0) || "U"}
        </div>
        <span className="text-xs font-semibold text-gray-700 truncate">
          {gp.currentUser}
        </span>
      </div>
    </div>
        </div>
      )}

      

     

      <EditGatePassModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        gp={gp}
        p={p}
        axiosSecure={axiosSecure}
        setGatePasses={setGatePasses}
      />
    </div>
  );
};

export default ActionDropdown;