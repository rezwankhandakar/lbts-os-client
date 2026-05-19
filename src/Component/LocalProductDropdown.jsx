// ════════════════════════════════════════════════════════════════════════
// LocalProductDropdown — instant local suggestions for the Product Name
// field, sourced from the with-model + without-model master tables.
//
// Why a separate dropdown?  The Product Name field already has a server-
// driven AutoDropdown (history of previously typed names).  This one
// sits BELOW that dropdown — or alone when activeField points here — and
// surfaces the canonical product names so the user picks one that the
// rate-matcher knows about.  When the user picks an item we set the
// product-name form value and close.
//
// Props:
//   fieldKey      — string identifying this dropdown instance
//   activeField   — currently focused field key (shared across dropdowns)
//   setActiveField— setter to close on outside click / selection
//   suggestions   — list of { name, hasModel } objects from suggestProducts()
//   onPick        — (name) => void   sets the form value
// ════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from "react";

const LocalProductDropdown = ({
  fieldKey,
  activeField,
  setActiveField,
  suggestions,
  onPick,
}) => {
  const dropdownRef = useRef();

  useEffect(() => {
    const onOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveField((cur) => (cur === fieldKey ? null : cur));
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [fieldKey, setActiveField]);

  if (activeField !== fieldKey || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <ul
      ref={dropdownRef}
      className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-44 overflow-y-auto mt-0.5"
    >
      {suggestions.map((s, i) => (
        <li
          key={i}
          onMouseDown={(e) => {
            // mousedown (not click) so the input blur doesn't fire first
            // and close the dropdown before pick.
            e.preventDefault();
            onPick(s.name);
            setActiveField(null);
          }}
          className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
        >
          <span className="text-slate-800 truncate">{s.name}</span>
          <span
            className={
              "ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0 " +
              (s.hasModel
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200")
            }
          >
            {s.hasModel ? "model" : "no-model"}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default LocalProductDropdown;