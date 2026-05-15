// ═══════════════════════════════════════════════════════════════════
//  LocalAddressDropdown.jsx
//  Typeahead dropdown for thana / district fields backed by the
//  built-in Bangladesh master list — NO server call, instant after
//  1-2 letters.  Handles typos via Levenshtein in the matcher.
// ═══════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

/**
 *  Props:
 *    fieldKey         — unique key for this field (e.g. "thana" / "district")
 *    activeField      — currently open field key (from parent state)
 *    setActiveField   — setter
 *    suggestions      — array of suggestion items
 *                         district mode: ["Dhaka", "Cumilla", ...]
 *                         thana mode   : [{ thana, district }, ...]
 *    mode             — "thana" | "district"
 *    onPick(value, item)  — called when user selects a suggestion;
 *                            item is the original suggestion object.
 */
const LocalAddressDropdown = ({
  fieldKey,
  activeField,
  setActiveField,
  suggestions,
  mode,
  onPick,
}) => {
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveField(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [setActiveField]);

  if (activeField !== fieldKey || !suggestions?.length) return null;

  return (
    <ul
      ref={dropdownRef}
      className="absolute top-full left-0 w-full bg-white border border-slate-200
                 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto mt-1"
    >
      {suggestions.map((item, i) => {
        const isDistrict = mode === "district";
        const primary = isDistrict ? item : item.thana;
        const secondary = isDistrict ? null : item.district;

        return (
          <li
            key={`${primary}-${secondary || ""}-${i}`}
            onClick={() => {
              onPick(primary, item);
              setActiveField(null);
            }}
            className="px-3 py-2 hover:bg-orange-50 cursor-pointer
                       flex items-center justify-between gap-2
                       border-b border-slate-50 last:border-b-0"
          >
            <span className="text-sm text-slate-800 font-medium truncate">
              {primary}
            </span>
            {secondary && (
              <span className="text-[10px] text-slate-400 font-semibold uppercase
                                flex items-center gap-1 shrink-0">
                <MapPin size={9} />
                {secondary}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default LocalAddressDropdown;