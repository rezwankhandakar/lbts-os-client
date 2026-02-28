
import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useRole from "../hooks/useRole";
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
    const [receiverFilter, setReceiverFilter] = useState("");
    const [zoneFilter, setZoneFilter] = useState("");
    const [productFilter, setProductFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
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
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchChallans(month, year, searchText);
    }, [month, year, searchText]);

    const handleResetAll = () => {
        setMonth(new Date().getMonth() + 1);
        setYear(new Date().getFullYear());
        if (setSearchText) setSearchText(""); 
        setCustomerFilter("");
        setAddressFilter("");
        setReceiverFilter("");
        setZoneFilter("");
        setProductFilter("");
        setModelFilter("");
        setUserFilter("");
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

    const getUniqueValues = (arr, field) => {
        const values = arr.flatMap((c) => {
            if (field === "productName" || field === "model") {
                return c.products?.map((p) => p[field]) || [];
            }
            return c[field] ? [c[field]] : [];
        });
        return [...new Set(values)];
    };

    const getFilteredData = () => {
        const rows = [];
        challans.forEach((c) => {
            c.products?.forEach((p) => {
                const s = searchText.toLowerCase();
                const matchesSearch = !searchText || 
                    [c.customerName, c.address, c.receiverNumber, c.zone, c.currentUser, p.productName, p.model]
                    .some(val => val?.toLowerCase().includes(s));

                const matchesFilters = 
                    (!customerFilter || c.customerName === customerFilter) &&
                    (!addressFilter || c.address === addressFilter) &&
                    (!receiverFilter || c.receiverNumber === receiverFilter) &&
                    (!zoneFilter || c.zone === zoneFilter) &&
                    (!productFilter || p.productName === productFilter) &&
                    (!modelFilter || p.model === modelFilter) &&
                    (!userFilter || c.currentUser === userFilter) &&
                    (!dateFilter || c.createdAt?.slice(0, 10) === dateFilter);

                if (matchesSearch && matchesFilters) {
                    rows.push({ c, p });
                }
            });
        });
        return rows;
    };

    const filteredRows = getFilteredData();
    const totalQty = filteredRows.reduce((sum, item) => sum + (Number(item.p.quantity) || 0), 0);

    const handleExportExcel = () => {
        if (filteredRows.length === 0) {
            Swal.fire({ icon: "warning", title: "No Data", text: "No data available to export!" });
            return;
        }

        Swal.fire({
            title: "Export to Excel?",
            text: `Export ${filteredRows.length} rows to Challan Report?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            confirmButtonText: "Yes, Export!",
        }).then((result) => {
            if (result.isConfirmed) {
                const exportData = filteredRows.map(({ c, p }) => ({
                    "Date": c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
                    Customer: c.customerName,
                    Address: c.address,
                    "Receiver No": c.receiverNumber,
                    Zone: c.zone,
                    Product: p.productName,
                    Model: p.model,
                    Qty: p.quantity,
                    User: c.currentUser,
                }));

                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "ChallanReport");
                const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                const blob = new Blob([buffer], { type: "application/octet-stream" });
                saveAs(blob, `Challan_Report_${month}_${year}.xlsx`);
                Swal.fire({ icon: "success", title: "Exported!", timer: 1500, showConfirmButton: false });
            }
        });
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
                        <button onClick={handleResetAll} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm">Reset All</button>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-green-700">Challan Inventory</h2>
                    {role === "admin" && (
                        <button onClick={handleExportExcel} className="bg-green-600 text-white px-3 py-1 rounded shadow-sm hover:bg-green-700">Export Excel</button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-6">Loading...</div>
                ) : filteredRows.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 italic border rounded">No challans found.</div>
                ) : (
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-green-600 text-white text-center">
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Customer</th>
                                <th className="border p-2">Address</th>
                                <th className="border p-2">Receiver No</th>
                                <th className="border p-2">Zone</th>
                                <th className="border p-2">Product</th>
                                <th className="border p-2">Model</th>
                                <th className="border p-2">Qty</th>
                                <th className="border p-2">Action</th>
                            </tr>

                            <tr className="bg-green-50">
                                <th className="border p-1"><input type="date" className="w-full border rounded text-xs p-1" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} /></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}><option value="">All</option>{getUniqueValues(challans, "customerName").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={addressFilter} onChange={(e) => setAddressFilter(e.target.value)}><option value="">All</option>{getUniqueValues(challans, "address").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={receiverFilter} onChange={(e) => setReceiverFilter(e.target.value)}><option value="">All</option>{getUniqueValues(challans, "receiverNumber").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}><option value="">All</option>{getUniqueValues(challans, "zone").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}><option value="">All</option>{getUniqueValues(challans, "productName").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}><option value="">All</option>{getUniqueValues(challans, "model").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                                <th className="border p-1 bg-white text-blue-700 font-bold">{totalQty}</th>
                                <th className="border p-1"><select className="w-full border rounded font-normal text-xs p-1" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}><option value="">All</option>{getUniqueValues(challans, "currentUser").map(v => <option key={v} value={v}>{v}</option>)}</select></th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRows.map(({ c, p }, idx) => (
                                <tr key={`${c._id}-${idx}`} className="text-center even:bg-gray-50 hover:bg-amber-50 transition-colors">
                                    <td className="border px-2 py-1 whitespace-nowrap">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}</td>
                                    <td className="border px-2 py-1 font-medium">{c.customerName}</td>
                                    <td className="border px-2 py-1 text-gray-600 truncate max-w-[150px]" title={c.address}>{c.address}</td>
                                    <td className="border px-2 py-1">{c.receiverNumber}</td>
                                    <td className="border px-2 py-1">{c.zone}</td>
                                    <td className="border px-2 py-1">{p.productName}</td>
                                    <td className="border px-2 py-1">{p.model}</td>
                                    <td className="border px-2 py-1 font-bold text-blue-800">{p.quantity}</td>
                                    <td className="border px-2 py-1">
                                          action
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AllChallan;
