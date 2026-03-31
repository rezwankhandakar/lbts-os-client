

import React, { useState, useRef, useEffect } from "react";
import EditGatePassModal from "./EditGatePassModal";
import Swal from "sweetalert2";
import { CgPlayButtonR } from "react-icons/cg";

const ActionDropdown = ({ gp, p, axiosSecure, setGatePasses }) => {
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
            
            Swal.fire("Error!", "Delete failed.", "error");
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
      {/* Trigger Button */}
      <button onClick={() => setOpen(!open)} className="">
        <CgPlayButtonR
          className={`text-blue-500 transition-transform duration-300 ${
            open ? "rotate-90" : "rotate-0"
          }`}
          size={20}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              setEditOpen(true);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-blue-500 hover:text-white flex items-center gap-2 text-sm transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-3 py-2 hover:bg-red-500 hover:text-white flex items-center gap-2 text-sm transition-colors"
          >
            🗑️ Delete
          </button>

          {/* User Info Section (Same as Challan Design) */}
          <div className="bg-gray-100 px-3 py-1 italic text-[10px] text-gray-500 border-t">
            User: {gp.currentUser || "Admin"}
          </div>
        </div>
      )}

      {/* Modal */}
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