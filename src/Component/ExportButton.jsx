// ═══════════════════════════════════════════════════════════════════
// ExportButton.jsx — Reusable export action button (FIX #50)
// ═══════════════════════════════════════════════════════════════════
//
// Usage:
//   <ExportButton
//     endpoint="/challans/bulk-export"
//     params={{ month: 4, year: 2026 }}
//     exporter={exportChallansToExcel}
//     filename="Challans"
//     month={month}
//     year={year}
//   />
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import useAxiosSecure from "../hooks/useAxiosSecure";

const ExportButton = ({
  endpoint,
  params = {},
  exporter,          // function(data, month, year) that triggers download
  month,
  year,
  label = "Export Excel",
  className = "",
  disabled = false,
}) => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(endpoint, { params });
      const data = res?.data?.data || [];
      if (!Array.isArray(data) || data.length === 0) {
        toast.error("No data to export for this period");
        return;
      }
      exporter(data, month, year);
      toast.success(`✅ Exported ${data.length} records`);
    } catch (err) {
      console.error("Export failed:", err);
      if (err?.response?.status === 403) {
        toast.error("You don't have permission to export");
      } else {
        toast.error("Export failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading || disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-t-green-700 border-green-200 rounded-full animate-spin" />
      ) : (
        <FiDownload className="w-4 h-4" />
      )}
      {loading ? "Exporting..." : label}
    </button>
  );
};

export default ExportButton;