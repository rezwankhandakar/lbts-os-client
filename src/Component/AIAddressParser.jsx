import React, { useState } from "react";
import { Sparkles, Loader2, Check, AlertTriangle, X } from "lucide-react";
import Swal from "sweetalert2";

/**
 * AI Address Parser button + result handler
 *
 * Props:
 *  - axiosSecure: configured axios instance
 *  - getAddress: () => string — function to get current address field value
 *  - setAddress: (value) => void — setValue for address
 *  - setThana: (value) => void — setValue for thana
 *  - setDistrict: (value) => void — setValue for district
 */
const AIAddressParser = ({ axiosSecure, getAddress, setAddress, setThana, setDistrict }) => {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleParse = async () => {
    const rawAddress = (getAddress() || "").trim();

    if (rawAddress.length < 5) {
      Swal.fire({
        icon: "warning",
        title: "Address Too Short",
        text: "Please paste the address first (at least 5 characters)",
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);
    setLastResult(null);

    try {
      const res = await axiosSecure.post("/parse-address", { address: rawAddress });
      const data = res.data;

      if (!data.success) {
        throw new Error(data.message || "AI parsing failed");
      }

      // Apply results to form
      if (data.cleanAddress) setAddress(data.cleanAddress);
      if (data.thana) setThana(data.thana);
      if (data.district) setDistrict(data.district);

      setLastResult(data);

      // Show feedback based on confidence
      const icon =
        data.confidence === "high" ? "success" :
        data.confidence === "medium" ? "info" : "warning";

      const title =
        data.confidence === "high" ? "✓ Address Parsed" :
        data.confidence === "medium" ? "Address Parsed (Please Verify)" :
        "Low Confidence — Please Verify Manually";

      const detailLines = [];
      if (data.cleanAddress) detailLines.push(`📍 <b>${data.cleanAddress}</b>`);
      if (data.thana) detailLines.push(`Thana: <b>${data.thana}</b>`);
      else detailLines.push(`<span style="color:#dc2626">Thana: not detected</span>`);
      if (data.district) detailLines.push(`District: <b>${data.district}</b>`);
      else detailLines.push(`<span style="color:#dc2626">District: not detected</span>`);
      if (data.notes) detailLines.push(`<i style="color:#6b7280;font-size:11px">${data.notes}</i>`);
      if (data.cached) detailLines.push(`<span style="color:#9ca3af;font-size:10px">(from cache)</span>`);

      Swal.fire({
        icon,
        title,
        html: detailLines.join("<br/>"),
        timer: data.confidence === "high" ? 2000 : 4500,
        showConfirmButton: data.confidence !== "high",
      });

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Unknown error";
      Swal.fire({
        icon: "error",
        title: "AI Parsing Failed",
        text: msg,
        timer: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  // Confidence badge color
  const badgeColor =
    lastResult?.confidence === "high" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    lastResult?.confidence === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
    "bg-rose-100 text-rose-700 border-rose-200";

  const badgeIcon =
    lastResult?.confidence === "high" ? <Check size={11} /> :
    lastResult?.confidence === "medium" ? <AlertTriangle size={11} /> :
    <X size={11} />;

  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        type="button"
        onClick={handleParse}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                   bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                   hover:from-purple-600 hover:to-indigo-700
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-sm transition-all"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles size={12} />
            <span>AI Detect Thana &amp; District</span>
          </>
        )}
      </button>

      {lastResult && !loading && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${badgeColor}`}
          title={lastResult.notes || ""}
        >
          {badgeIcon}
          {lastResult.confidence}
        </span>
      )}
    </div>
  );
};

export default AIAddressParser;