

import React, { useEffect, useRef, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import ActionDropdown from "../Component/ActionDropdown";

const AllGatePass = () => {
    const axiosSecure = useAxiosSecure();
    const [gatePasses, setGatePasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const { searchText } = useSearch();

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


    // const ActionDropdown = ({ gp, p, axiosSecure, setGatePasses }) => {
    //     const [open, setOpen] = useState(false);
    //     const ref = useRef(null); // dropdown parent ref

    //     const handleDelete = () => {
    //         if (window.confirm("Are you sure you want to delete this entry?")) {
    //             axiosSecure
    //                 .delete(`/gate-pass/${gp._id}`)
    //                 .then(() => {
    //                     setGatePasses(prev => prev.filter(g => g._id !== gp._id));
    //                 })
    //                 .catch(err => console.error(err));
    //         }
    //     };

    //     // Close dropdown if click outside
    //     useEffect(() => {
    //         const handleClickOutside = (event) => {
    //             if (ref.current && !ref.current.contains(event.target)) {
    //                 setOpen(false);
    //             }
    //         };
    //         document.addEventListener("mousedown", handleClickOutside);
    //         return () => document.removeEventListener("mousedown", handleClickOutside);
    //     }, []);

    //     return (
    //         <div ref={ref} className="relative inline-block text-left">
    //             <button
    //                 onClick={() => setOpen(prev => !prev)}
    //                 className="bg-amber-300 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-xs font-medium flex items-center justify-center gap-1 shadow-sm transition"
    //                 style={{ minWidth: '60px' }}
    //             >
    //                 Actions
    //             </button>

    //             {open && (
    //                 <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow-lg z-50">
    //                     <button
    //                         onClick={() => alert(`Edit ${gp._id} - ${p.productName}`)}
    //                         className="w-full text-left px-3 py-1 hover:bg-blue-500 hover:text-white flex items-center gap-1 text-sm"
    //                     >
    //                         ✏️ Edit
    //                     </button>
    //                     <button
    //                         onClick={handleDelete}
    //                         className="w-full text-left px-3 py-1 hover:bg-red-500 hover:text-white flex items-center gap-1 text-sm"
    //                     >
    //                         🗑️ Delete
    //                     </button>
    //                 </div>
    //             )}
    //         </div>
    //     );
    // };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-full mx-auto bg-white shadow-sm rounded p-4 overflow-x-auto">

                {/* <h2 className="text-xl font-semibold mb-4 text-center">Gate Pass</h2> */}

                {/* ⭐ Filter UI */}
                <div className="relative flex flex-wrap items-center gap-2 mb-6">

                    {/* Left Filters */}
                    <div className="flex gap-2">
                        <select
                            className="border px-2 py-1 rounded"
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
                            className="border px-2 py-1 w-24 rounded"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        />

                        <button
                            onClick={() => {
                                // Reset month/year
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
                            className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Center Title */}
                    <h2 className="absolute left-1/2 -translate-x-1/2 text-xl md:text-2xl font-bold">
                        Gate Pass
                    </h2>

                </div>


                {/* ⭐ Table */}
                {loading ? (
                    <div className="text-center py-6">Loading...</div>
                ) : gatePasses.length === 0 ? (
                    <div className="text-center py-6">No gate pass found.</div>
                ) : (
                    <table className="table-auto w-full border-collapse text-sm">
                        <thead>
                            {/* Column titles */}
                            <tr className="bg-green-500">

                                <th className="border px-2 py-1">Trip Do</th>
                                <th className="border px-2 py-1">Trip Date</th>
                                <th className="border px-2 py-1">Customer</th>
                                <th className="border px-2 py-1">CSD</th>
                                <th className="border px-2 py-1">Vehicle No</th>
                                <th className="border px-2 py-1">Zone</th>
                                <th className="border px-2 py-1">Product</th>
                                <th className="border px-2 py-1">Model</th>
                                <th className="border px-2 py-1">Qty</th>
                                <th className="border px-2 py-1">User</th>
                                <th className="border px-2 py-1">Action</th>
                            </tr>

                            {/* Column filters */}
                            <tr className="bg-green-100">
                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={tripDoFilter}
                                        onChange={(e) => setTripDoFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "tripDo").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border px-2 py-1">
                                    <input
                                        type="date"
                                        className="w-full border"
                                        value={tripDateFilter}
                                        onChange={(e) => setTripDateFilter(e.target.value)}
                                    />
                                </th>

                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={customerFilter}
                                        onChange={(e) => setCustomerFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "customerName").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={csdFilter}
                                        onChange={(e) => setCsdFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "csd").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={vehicleFilter}
                                        onChange={(e) => setVehicleFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "vehicleNo").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={zoneFilter}
                                        onChange={(e) => setZoneFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "zone").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={productFilter}
                                        onChange={(e) => setProductFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "productName").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={modelFilter}
                                        onChange={(e) => setModelFilter(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {getUniqueValues(gatePasses, "model").map((val) => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </th>

                                <th className="border px-2 py-1">{/* Qty filter if needed */}</th>

                                <th className="border px-2 py-1">
                                    <select
                                        className="w-full"
                                        value={userFilter}
                                        onChange={(e) => setUserFilter(e.target.value)}
                                    >
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
                                            (!searchText || gp.tripDo?.toLowerCase().includes(s) ||
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
                                            (!tripDateFilter || gp.tripDate?.slice(0, 10) === tripDateFilter) // <-- ekhane add koro
                                        );
                                    })
                                    .map((p, idx) => (
                                        <tr key={`${gp._id}-${idx}`} className="hover:bg-amber-200">
                                            <td className="border px-2 py-1">{gp.tripDo}</td>
                                            <td className="border px-2 py-1">{gp.tripDate ? new Date(gp.tripDate).toLocaleDateString() : "-"}</td>
                                            <td className="border px-2 py-1">{gp.customerName}</td>
                                            <td className="border px-2 py-1">{gp.csd}</td>
                                            <td className="border px-2 py-1">{gp.vehicleNo}</td>
                                            <td className="border px-2 py-1">{gp.zone}</td>
                                            <td className="border px-2 py-1">{p.productName}</td>
                                            <td className="border px-2 py-1">{p.model}</td>
                                            <td className="border px-2 py-1">{p.quantity}</td>
                                            <td className="border px-2 py-1">{gp.currentUser}</td>
                                            <td className="border px-2 py-1 text-center relative">
                                                <ActionDropdown gp={gp} p={p} axiosSecure={axiosSecure} setGatePasses={setGatePasses} />
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