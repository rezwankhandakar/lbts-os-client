
import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useRole from "../hooks/useRole";
import ChallanActionDropdown from "../Component/ChallanActionDropdown";
import Swal from "sweetalert2";

const AllChallan = () => {
  const axiosSecure = useAxiosSecure();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchText, setSearchText } = useSearch();
  const { role } = useRole();

  // Filters state
  const [customerFilter, setCustomerFilter] = useState("");
  const [addressFilter, setAddressFilter] = useState("");
  const [thanaFilter, setThanaFilter] = useState(""); 
  const [districtFilter, setDistrictFilter] = useState(""); 
  const [receiverFilter, setReceiverFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchChallans = async (m, y, search) => {
    setLoading(true);
    try {
      let url = `/challans?month=${m}&year=${y}`;
      if (search) url += `&search=${search}`;
      const res = await axiosSecure.get(url);
      setChallans(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching challans:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChallans(month, year, searchText);
  }, [month, year, searchText]);

  const getUniqueValues = (arr, field) => {
    const values = arr.flatMap((c) => {
      if (field === "model") {
        return c.products?.map((p) => p[field]) || [];
      }
      return c[field] ? [c[field]] : [];
    });
    return [...new Set(values)].sort();
  };

  const handleResetAll = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    if (setSearchText) setSearchText("");
    setCustomerFilter("");
    setAddressFilter("");
    setThanaFilter("");
    setDistrictFilter("");
    setReceiverFilter("");
    setZoneFilter("");
    setModelFilter("");
    setDateFilter("");

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'All Filters Reset',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const getFilteredData = () => {
    const rows = [];
    challans.forEach((c) => {
      c.products?.forEach((p) => {
        const s = searchText ? searchText.toLowerCase() : "";

        // Global Search Match
        const matchesSearch =
          !searchText ||
          [
            c.customerName,
            c.address,
            c.thana,
            c.district,
            c.receiverNumber,
            c.zone,
            c.currentUser,
            p.productName,
            p.model,
          ].some((val) => val?.toLowerCase().includes(s));

        // Column Filters Match
        const matchesFilters =
          (!customerFilter || c.customerName === customerFilter) &&
          (!addressFilter || c.address === addressFilter) &&
          (!thanaFilter || c.thana === thanaFilter) &&
          (!districtFilter || c.district === districtFilter) &&
          (!receiverFilter || c.receiverNumber === receiverFilter) &&
          (!zoneFilter || c.zone === zoneFilter) &&
          (!modelFilter || p.model === modelFilter) &&
          (!dateFilter ||
            (c.createdAt &&
              new Date(c.createdAt).toISOString().slice(0, 10) === dateFilter));

        if (matchesSearch && matchesFilters) {
          rows.push({ c, p });
        }
      });
    });
    return rows;
  };

  const filteredRows = getFilteredData();
  const filteredChallansOnly = [
    ...new Map(filteredRows.map(item => [item.c._id, item.c])).values()
  ];
  const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.p.quantity) || 0), 0);

  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      Swal.fire({ icon: "warning", title: "No Data", text: "No data available to export!" });
      return;
    }

    const exportData = filteredRows.map(({ c, p }) => ({
      "Date": c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      "Customer": c.customerName,
      "Address": c.address,
      "Thana": c.thana || "",
      "District": c.district || "",
      "Receiver No": c.receiverNumber,
      "Zone": c.zone,
      "Model": p.model,
      "Qty": p.quantity,
      "User": c.currentUser || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ChallanReport");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `Challan_Report_${month}_${year}.xlsx`);
    Swal.fire({ icon: "success", title: "Exported!", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <select className="border px-2 py-1 rounded" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <input type="number" className="border px-2 py-1 rounded w-24" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
            <button onClick={handleResetAll} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm text-sm">Reset All</button>
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold text-green-700">Challan Inventory</h2>
          
          {role === "admin" && (
            <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-1 rounded shadow-sm hover:bg-green-700 transition-colors">
              Export Excel
            </button>
          )}
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="text-center py-10 text-green-600 font-bold">Loading Challans...</div>
        ) : (
          <table className="w-full border-collapse text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-green-600 text-white text-center">
                <th className="border p-2">Date</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">Thana</th>
                <th className="border p-2">District</th>
                <th className="border p-2">Receiver No</th>
                <th className="border p-2">Zone</th>
                <th className="border p-2">Model</th>
                <th className="border p-2">Qty</th>
                <th className="border p-2">Action</th>
              </tr>
              
              <tr className="bg-green-50">
                <th className="border p-1"><input type="date" className="w-full text-xs p-1 border rounded" value={dateFilter} onChange={e => setDateFilter(e.target.value)} /></th>
                <th className="border p-1">
                  <select className="w-full text-xs p-1 border rounded font-normal" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(filteredChallansOnly, "customerName").map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </th>
                <th className="border p-1">
                   <select className="w-full text-xs p-1 border rounded font-normal" value={addressFilter} onChange={e => setAddressFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(filteredChallansOnly, "address").map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </th>
                <th className="border p-1">
                   <select className="w-full text-xs p-1 border rounded font-normal" value={thanaFilter} onChange={e => setThanaFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(filteredChallansOnly, "thana").map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </th>
                <th className="border p-1">
                   <select className="w-full text-xs p-1 border rounded font-normal" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(filteredChallansOnly, "district").map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </th>
                <th className="border p-1">
                   <select className="w-full text-xs p-1 border rounded font-normal" value={receiverFilter} onChange={e => setReceiverFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(filteredChallansOnly, "receiverNumber").map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </th>
                <th className="border p-1">
                   <select className="w-full text-xs p-1 border rounded font-normal" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(filteredChallansOnly, "zone").map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </th>
                <th className="border p-1">
                   <select className="w-full text-xs p-1 border rounded font-normal" value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
                    <option value="">All</option>
                    {getUniqueValues(filteredChallansOnly, "model").map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </th>
                <th className="border p-1 bg-white text-blue-700 font-bold text-center">{totalQty}</th>
                <th className="border p-1 bg-white"></th>
              </tr>
            </thead>
            
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map(({ c, p }, idx) => (
                  <tr key={`${c._id}-${idx}`} className="text-center even:bg-gray-50 hover:bg-amber-50 transition-colors">
                    <td className="border px-2 py-1 whitespace-nowrap">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="border px-2 py-1 font-medium text-left">{c.customerName}</td>
                    <td className="border px-2 py-1 text-left truncate max-w-[150px]" title={c.address}>{c.address}</td>
                    <td className="border px-2 py-1 text-left">{c.thana || "-"}</td>
                    <td className="border px-2 py-1 text-left">{c.district || "-"}</td>
                    <td className="border px-2 py-1">{c.receiverNumber}</td>
                    <td className="border px-2 py-1">{c.zone}</td>
                    <td className="border px-2 py-1">{p.model}</td>
                    <td className="border px-2 py-1 font-bold text-blue-800">{p.quantity}</td>
                    <td className="border px-2 py-1">
                      <ChallanActionDropdown 
                        challan={c} 
                        product={p} 
                        axiosSecure={axiosSecure} 
                        setChallans={setChallans} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-10 text-gray-500 italic">No Challans found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllChallan;  


