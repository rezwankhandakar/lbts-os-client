import React, { useState, useRef, useEffect } from "react";
import EditGatePassModal from "./EditGatePassModal";


const ActionDropdown = ({ gp, p, axiosSecure, setGatePasses }) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false); // modal state
  const ref = useRef(null);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      axiosSecure
        .delete(`/gate-pass/${gp._id}`)
        .then(() => {
          setGatePasses(prev => prev.filter(g => g._id !== gp._id));
        })
        .catch(err => console.error(err));
    }
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
        className="bg-amber-300 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 shadow-sm transition"
        style={{ minWidth: '60px' }}
      >
        Actions
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