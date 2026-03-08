import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

const DeliveredPage = () => {
  const axiosSecure = useAxiosSecure();
  const { searchText, setSearchText } = useSearch();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [customerFilter, setCustomerFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Fetch deliveries from backend
  const fetchDeliveries = async (m, y, search) => {
    setLoading(true);
    try {
      let url = `/deliveries?month=${m}&year=${y}`;
      if (search) url += `&search=${search}`;
      const res = await axiosSecure.get(url);
      setDeliveries(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveries(month, year, searchText);
  }, [month, year, searchText]);

  // Reset All filters and search
  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");

    setCustomerFilter("");
    setZoneFilter("");
    setVehicleFilter("");
    setDriverFilter("");
    setProductFilter("");
    setModelFilter("");

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Filters & Search Cleared",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // Unique values for filters
  const getUniqueValues = (arr, field) => {
    const map = new Map();
    arr.forEach((d) => {
      if (field === "productName" || field === "model") {
        d.products?.forEach((p) => {
          const val = p[field]?.toString().trim();
          if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
        });
      } else {
        const val = d[field]?.toString().trim();
        if (val && !map.has(val.toLowerCase())) map.set(val.toLowerCase(), val);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  };

  // Filtered data
  const getFilteredData = () => {
    const rows = [];
    deliveries.forEach((d) => {
      d.products?.forEach((p) => {
        const s = searchText ? searchText.toLowerCase() : "";
        const matchesSearch =
          !searchText ||
          [
            d.customerName,
            d.zone,
            d.vehicleNumber,
            d.driverName,
            p.productName,
            p.model,
          ].some((val) => val?.toLowerCase().includes(s));

        const matchesFilters =
          (!customerFilter || d.customerName?.toLowerCase() === customerFilter.toLowerCase()) &&
          (!zoneFilter || d.zone?.toLowerCase() === zoneFilter.toLowerCase()) &&
          (!vehicleFilter || d.vehicleNumber?.toLowerCase() === vehicleFilter.toLowerCase()) &&
          (!driverFilter || d.driverName?.toLowerCase() === driverFilter.toLowerCase()) &&
          (!productFilter || p.productName?.toLowerCase() === productFilter.toLowerCase()) &&
          (!modelFilter || p.model?.toLowerCase() === modelFilter.toLowerCase());

        if (matchesSearch && matchesFilters) {
          rows.push({ d, p });
        }
      });
    });
    return rows;
  };

  const filteredRows = getFilteredData();
  const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.p.quantity) || 0), 0);

  // Export Excel
  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "No data available to export!",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    Swal.fire({
      title: "Export to Excel?",
      text: `You are about to export ${filteredRows.length} rows of data.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Export it!",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          const exportData = filteredRows.map(({ d, p }) => ({
            Customer: d.customerName,
            Zone: d.zone,
            Address: d.address,
            Vehicle: d.vehicleNumber,
            Driver: d.driverName,
            "Driver Number": d.driverNumber,
            Product: p.productName,
            Model: p.model,
            Qty: p.quantity,
          }));

          const ws = XLSX.utils.json_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
          const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
          const blob = new Blob([buffer], { type: "application/octet-stream" });
          saveAs(blob, `Delivered_${month}_${year}.xlsx`);

          Swal.fire({
            icon: "success",
            title: "Exported!",
            text: "Your Excel file has been downloaded successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire("Error", "Something went wrong during export", "error");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 w-full lg:w-auto">
            <select
              className="border px-2 py-1.5 rounded bg-white text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 w-full sm:w-auto"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="border px-2 py-1.5 rounded w-full sm:w-24 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />

            <button
              onClick={handleResetAll}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded shadow-sm text-sm transition-all w-full sm:w-auto active:scale-95"
            >
              Reset All
            </button>
          </div>

          <div className="text-center order-first lg:order-none">
            <h2 className="text-xl md:text-2xl font-bold text-green-700">
              Delivered Orders
            </h2>
          </div>

          <div className="w-full lg:w-auto">
            <button
              onClick={handleExportExcel}
              className="bg-green-600 text-white px-4 py-1.5 rounded shadow-sm hover:bg-green-700 transition-all w-full sm:w-auto text-sm font-medium active:scale-95"
            >
              Export Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 font-medium text-green-600">Loading Data...</div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-10 text-gray-500 italic border rounded-lg">No deliveries found.</div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-green-600 text-white text-center">
              <tr>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Zone</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">Vehicle</th>
                <th className="border p-2">Driver</th>
                <th className="border p-2">Driver Number</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">Model</th>
                <th className="border p-2">Qty</th>
              </tr>

              {/* Filters Row */}
              <tr className="bg-green-50 text-center">
                <th className="border p-1">
                  <select className="w-full border rounded text-xs p-1" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "customerName").map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border rounded text-xs p-1" value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "zone").map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1"></th>
                <th className="border p-1">
                  <select className="w-full border rounded text-xs p-1" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "vehicleNumber").map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border rounded text-xs p-1" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "driverName").map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1"></th>
                <th className="border p-1">
                  <select className="w-full border rounded text-xs p-1" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "productName").map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border rounded text-xs p-1" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "model").map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1 font-bold">{totalQty}</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map(({ d, p }, idx) => (
                <tr key={`${d._id}-${idx}`} className="text-center even:bg-gray-50 hover:bg-amber-50 transition-colors">
                  <td className="border px-2 py-1">{d.customerName}</td>
                  <td className="border px-2 py-1">{d.zone}</td>
                  <td className="border px-2 py-1">{d.address}</td>
                  <td className="border px-2 py-1">{d.vehicleNumber}</td>
                  <td className="border px-2 py-1">{d.driverName}</td>
                  <td className="border px-2 py-1">{d.driverNumber}</td>
                  <td className="border px-2 py-1">{p.productName || "-"}</td>
                  <td className="border px-2 py-1">{p.model}</td>
                  <td className="border px-2 py-1 font-bold">{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DeliveredPage;