// AutoDropdown.js
import React, { useEffect, useRef } from "react";

const AutoDropdown = ({ fieldKey, autoData, activeField, setActiveField, setFormValue }) => {
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setActiveField]);

  if (activeField !== fieldKey || !autoData[fieldKey]?.length) return null;

  return (
    <ul
      ref={dropdownRef}
      className="absolute top-full left-0 w-full bg-white border rounded shadow z-50 max-h-40 overflow-y-auto"
    >
      {autoData[fieldKey].map((item, i) => (
        <li
          key={i}
          onClick={() => {
            setFormValue(item.value);
            setActiveField(null);
          }}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          {item.value}
        </li>
      ))}
    </ul>
  );
};

export default AutoDropdown;