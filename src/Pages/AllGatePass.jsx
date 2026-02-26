

import React, { useEffect, useRef, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import ActionDropdown from "../Component/ActionDropdown";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";

const AllGatePass = () => {
    const axiosSecure = useAxiosSecure();
    const [gatePasses, setGatePasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const { searchText } = useSearch();
    const { role } = useRole()

    const [tripDoFilter, setTripDoFilter] = useState("");
    const [customerFilter, setCustomerFilter] = useState("");
    const [csdFilter, setCsdFilter] = useState("");
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [zoneFilter, setZoneFilter] = useState("");
    const [productFilter, setProductFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [tripDateFilter, setTripDateFilter] = useState("");

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());


    const fetchGatePasses = async (m, y, search) => {
        setLoading(true);
        try {
            let url = `/gate-pass?month=${m}&year=${y}`;

            if (search) {
                url += `&search=${search}`;
            }

            const res = await axiosSecure.get(url);
            setGatePasses(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGatePasses(month, year, searchText);
    }, [month, year, searchText]);

    const getUniqueValues = (arr, field) => {
        const values = arr.flatMap((gp) => {
            if (field === "productName" || field === "model") {
                return gp.products?.map((p) => p[field]) || [];
            }
            return gp[field] ? [gp[field]] : [];
        });
        return [...new Set(values)];
    };

    // ✅ Excel Export Function (No feature changed)
    const handleExportExcel = () => {
        const rows = [];

        gatePasses.forEach((gp) => {
            gp.products
                ?.filter((p) => {
                    const s = searchText.toLowerCase();
                    return (
                        (!searchText ||
                            gp.tripDo?.toLowerCase().includes(s) ||
                            gp.customerName?.toLowerCase().includes(s) ||
                            gp.csd?.toLowerCase().includes(s) ||
                            gp.vehicleNo?.toLowerCase().includes(s) ||
                            gp.zone?.toLowerCase().includes(s) ||
                            gp.currentUser?.toLowerCase().includes(s) ||
                            p.productName?.toLowerCase().includes(s) ||
                            p.model?.toLowerCase().includes(s)
                        ) &&
                        (!tripDoFilter || gp.tripDo === tripDoFilter) &&
                        (!customerFilter || gp.customerName === customerFilter) &&
                        (!csdFilter || gp.csd === csdFilter) &&
                        (!vehicleFilter || gp.vehicleNo === vehicleFilter) &&
                        (!zoneFilter || gp.zone === zoneFilter) &&
                        (!productFilter || p.productName === productFilter) &&
                        (!modelFilter || p.model === modelFilter) &&
                        (!userFilter || gp.currentUser === userFilter) &&
                        (!tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter)
                    );
                })
                .forEach((p) => {
                    rows.push({
                        "Trip Do": gp.tripDo,
                        "Trip Date": gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "",
                        Customer: gp.customerName,
                        CSD: gp.csd,
                        "Vehicle No": gp.vehicleNo,
                        Zone: gp.zone,
                        Product: p.productName,
                        Model: p.model,
                        Qty: p.quantity,
                        User: gp.currentUser,
                    });
                });
        });

        if (rows.length === 0) {
            Swal.fire("No Data", "No data available to export", "warning");
            return;
        }

        // ✅ Confirmation Alert
        Swal.fire({
            title: "Export Excel?",
            text: `You are going to export ${rows.length} rows`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Export",
        }).then((result) => {
            if (result.isConfirmed) {
                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "GatePass");

                const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                const blob = new Blob([buffer], { type: "application/octet-stream" });

                saveAs(blob, `GatePass_${month}_${year}.xlsx`);

                Swal.fire("Exported!", "Excel file downloaded successfully", "success");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">

                {/* ⭐ Filter UI */}
                <div className="relative flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 mb-6">

                    {/* Left Filters */}
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <select
                            className="border px-2 py-1 rounded w-full sm:w-auto"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            <option value="">Month</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={i + 1}>
                                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Year"
                            className="border px-2 py-1 rounded w-full sm:w-24"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        />

                        <button
                            onClick={() => {
                                const currentMonth = new Date().getMonth() + 1;
                                const currentYear = new Date().getFullYear();
                                setMonth(currentMonth);
                                setYear(currentYear);

                                // Reset all column filters
                                setTripDoFilter("");
                                setCustomerFilter("");
                                setCsdFilter("");
                                setVehicleFilter("");
                                setZoneFilter("");
                                setProductFilter("");
                                setModelFilter("");
                                setUserFilter("");
                                setTripDateFilter("");
                            }}
                            className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded w-full sm:w-auto"
                        >
                            Reset
                        </button>
                        {role === "admin" && (
                            <button
                                onClick={handleExportExcel}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded w-full sm:w-auto"
                            >
                                Export
                            </button>
                        )}
                    </div>

                    {/* Center Title */}
                    <h2 className="mt-2 sm:mt-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2 text-xl md:text-2xl font-bold text-center w-full sm:w-auto">
                        Gate Pass
                    </h2>
                </div>


                {/* ⭐ Table */}
                {loading ? (
                    <div className="text-center py-6">Loading...</div>
                ) : gatePasses.length === 0 ? (
                    <div className="text-center py-6">No gate pass found.</div>
                ) : (
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10">
                            {/* Column titles */}
                            <tr className="bg-green-500 text-white text-center [&>th]:border [&>th]:border-black">
                                <th className="border px-3 py-2">Trip Do</th>
                                <th className="border px-3 py-2">Trip Date</th>
                                <th className="border px-3 py-2">Customer</th>
                                <th className="border px-3 py-2">CSD</th>
                                <th className="border px-3 py-2">Vehicle No</th>
                                <th className="border px-3 py-2">Zone</th>
                                <th className="border px-3 py-2">Product</th>
                                <th className="border px-3 py-2">Model</th>
                                <th className="border px-3 py-2">Qty</th>
                                <th className="border px-3 py-2">Action</th>
                            </tr>

                            {/* Filters */}
                            <tr className="bg-green-200 text-center">
                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={tripDoFilter} onChange={(e) => setTripDoFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "tripDo").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border p-1">
                                    <input type="date" className="w-full border rounded px-1 py-1 text-center" value={tripDateFilter} onChange={(e) => setTripDateFilter(e.target.value)} />
                                </th>

                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "customerName").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={csdFilter} onChange={(e) => setCsdFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "csd").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "vehicleNo").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "zone").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "productName").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "model").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border p-1">Sum</th>

                                <th className="border p-1">
                                    <select className="w-full border rounded px-1 py-1 text-center" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "currentUser").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>   
                            </tr>
                        </thead>

                        <tbody>
                            {gatePasses.map((gp) =>
                                gp.products
                                    ?.filter((p) => {
                                        const s = searchText.toLowerCase();
                                        return (
                                            (!searchText ||
                                                gp.tripDo?.toLowerCase().includes(s) ||
                                                gp.customerName?.toLowerCase().includes(s) ||
                                                gp.csd?.toLowerCase().includes(s) ||
                                                gp.vehicleNo?.toLowerCase().includes(s) ||
                                                gp.zone?.toLowerCase().includes(s) ||
                                                gp.currentUser?.toLowerCase().includes(s) ||
                                                p.productName?.toLowerCase().includes(s) ||
                                                p.model?.toLowerCase().includes(s)
                                            ) &&
                                            (!tripDoFilter || gp.tripDo === tripDoFilter) &&
                                            (!customerFilter || gp.customerName === customerFilter) &&
                                            (!csdFilter || gp.csd === csdFilter) &&
                                            (!vehicleFilter || gp.vehicleNo === vehicleFilter) &&
                                            (!zoneFilter || gp.zone === zoneFilter) &&
                                            (!productFilter || p.productName === productFilter) &&
                                            (!modelFilter || p.model === modelFilter) &&
                                            (!userFilter || gp.currentUser === userFilter) &&
                                            (!tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter)
                                        );
                                    })
                                    .map((p, idx) => (
                                        <tr key={`${gp._id}-${idx}`} className="text-center even:bg-gray-50 hover:bg-amber-100 transition">
                                            <td className="border px-2 py-1">{gp.tripDo}</td>
                                            <td className="border px-2 py-1">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "-"}</td>
                                            <td className="border px-2 py-1">{gp.customerName}</td>
                                            <td className="border px-2 py-1">{gp.csd}</td>
                                            <td className="border px-2 py-1">{gp.vehicleNo}</td>
                                            <td className="border px-2 py-1">{gp.zone}</td>
                                            <td className="border px-2 py-1">{p.productName}</td>
                                            <td className="border px-2 py-1">{p.model}</td>
                                            <td className="border px-2 py-1 font-semibold">{p.quantity}</td>
                                            <td className="border px-2 py-1">
                                                <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} currentUser={gp.currentUser}/>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                        

                    </table>
                )}
            </div>
        </div>
    );
};

export default AllGatePass;




