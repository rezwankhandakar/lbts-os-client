

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
  const [districtFilter, setDistrictFilter] = useState("");
  const [thanaFilter, setThanaFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [receiverFilter, setReceiverFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Fetch deliveries
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

  // Reset
const handleResetAll = () => {
  setMonth(new Date().getMonth() + 1);
  setYear(new Date().getFullYear());
  if (setSearchText) setSearchText("");

  setCustomerFilter("");
  setZoneFilter("");
  setDistrictFilter("");
  setThanaFilter("");
  setProductFilter("");
  setModelFilter("");
  setAddressFilter("");
  setReceiverFilter("");
  setDateFilter(""); // <-- Date filter ও রিসেট হবে

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Filters & Search Cleared",
    showConfirmButton: false,
    timer: 1500,
  });
};

  // Unique values
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
      const date = new Date(d.createdAt);
      const dMonth = date.getMonth() + 1;
      const dYear = date.getFullYear();

      if (dMonth !== month || dYear !== year) return;

      d.products?.forEach((p) => {
        const s = searchText ? searchText.toLowerCase() : "";

        const matchesSearch =
          !searchText ||
          [
            d.customerName,
            d.zone,
            d.address,
            d.receiverNumber,
            d.district,
            d.thana,
            p.productName,
            p.model,
            p.quantity?.toString(),
            date.toLocaleDateString(),
          ].some((val) => val?.toString().toLowerCase().includes(s));

        const matchesFilters =
          (!dateFilter || date.toISOString().slice(0, 10) === dateFilter) && 
          (!customerFilter || d.customerName?.toLowerCase() === customerFilter.toLowerCase()) &&
          (!zoneFilter || d.zone?.toLowerCase() === zoneFilter.toLowerCase()) &&
          (!addressFilter || d.address?.toLowerCase() === addressFilter.toLowerCase()) &&
          (!receiverFilter || d.receiverNumber?.toLowerCase() === receiverFilter.toLowerCase()) &&
          (!districtFilter || d.district?.toLowerCase() === districtFilter.toLowerCase()) &&
          (!thanaFilter || d.thana?.toLowerCase() === thanaFilter.toLowerCase()) &&
          (!productFilter || p.productName?.toLowerCase() === productFilter.toLowerCase()) &&
          (!modelFilter || p.model?.toLowerCase() === modelFilter.toLowerCase());

        if (matchesSearch && matchesFilters) {
          rows.push({ d, p, date });
        }
      });
    });
    return rows;
  };

  const filteredRows = getFilteredData();
  const totalQty = filteredRows.reduce(
    (sum, item) => sum + (Number(item.p.quantity) || 0),
    0
  );

  // Export Excel
  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      Swal.fire("No Data", "No data available to export!", "warning");
      return;
    }

    const exportData = filteredRows.map(({ d, p, date }) => ({
      Date: date.toLocaleDateString(),
      Customer: d.customerName,
      Zone: d.zone,
      Address: d.address,
      "Receiver Number": d.receiverNumber,
      District: d.district,
      Thana: d.thana,
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">

          <div className="flex gap-2">
            <select
              className="border px-2 py-1 rounded"
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
              className="border px-2 py-1 rounded w-24"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />

            <button
              onClick={handleResetAll}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Reset
            </button>
          </div>

          <h2 className="text-xl font-bold text-green-700">
            Delivered Orders
          </h2>

          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Export Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <table className="w-full border-collapse text-sm">

            <thead className="bg-green-600 text-white text-center">

              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Zone</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">Receiver</th>
                <th className="border p-2">District</th>
                <th className="border p-2">Thana</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">Model</th>
                <th className="border p-2">Qty</th>
              </tr>

              <tr className="bg-white text-black text-center">
                 <th className="border p-1">
    <input
      type="date"
      className="w-full border text-xs p-1"
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value)}
    />
  </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "customerName").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "zone").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={addressFilter}
                    onChange={(e) => setAddressFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "address").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={receiverFilter}
                    onChange={(e) => setReceiverFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "receiverNumber").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "district").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={thanaFilter}
                    onChange={(e) => setThanaFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "thana").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "productName").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1">
                  <select className="w-full border text-xs p-1"
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(deliveries, "model").map(v => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="border p-1 font-bold">{totalQty}</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map(({ d, p, date }, idx) => (
                <tr key={idx} className="text-center even:bg-gray-50">
                  <td className="border px-2 py-1">{date.toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{d.customerName}</td>
                  <td className="border px-2 py-1">{d.zone}</td>
                  <td 
          className="border px-1 py-1 w-20 max-w-75 truncate cursor-help" 
          title={d.address}
        >
          {d.address}
        </td>
                  <td className="border px-2 py-1">{d.receiverNumber}</td>
                  <td className="border px-2 py-1">{d.district}</td>
                  <td className="border px-2 py-1">{d.thana}</td>
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