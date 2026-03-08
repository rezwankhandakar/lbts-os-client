import React, { useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useSearch } from "../hooks/SearchContext";
import useRole from "../hooks/useRole";
import Swal from "sweetalert2";
import {
    FaEdit, FaTrashAlt, FaUserEdit, FaTimes,
    FaSave, FaBoxOpen, FaPlusCircle, FaTruck, FaPhoneAlt
} from "react-icons/fa";

const CreateDelivery = () => {
    const axiosSecure = useAxiosSecure();
    const [challans, setChallans] = useState([]);
    const [loading, setLoading] = useState(false);
    const { searchText } = useSearch();
    const { role } = useRole();

    // --- Delivery Details State ---
    const [deliveryInfo, setDeliveryInfo] = useState({
        vehicleNumber: "",
        vendorName: "",
        vendorNumber: "",
        driverName: "",
        driverNumber: ""
    });

    const [deliveryQueue, setDeliveryQueue] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingChallan, setEditingChallan] = useState(null);
    const [vehicleSuggestions, setVehicleSuggestions] = useState([]);

    const handleDeliveryInfoChange = (e) => {
        const { name, value } = e.target;
        setDeliveryInfo(prev => ({ ...prev, [name]: value }));
    };

    const fetchChallans = async (search) => {
        if (!search) {
            setChallans([]);
            return;
        }
        setLoading(true);
        try {
            const res = await axiosSecure.get(`/challans?search=${search}`);
            setChallans(res.data.data || res.data || []);
        } catch (err) {
            console.error("Error fetching challans:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchChallans(searchText);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchText]);

    const addToDelivery = (challan) => {
        const isExist = deliveryQueue.find(item => item._id === challan._id);
        if (!isExist) {
            setDeliveryQueue([...deliveryQueue, challan]);
        } else {
            Swal.fire("Note", "Already in delivery list", "info");
        }
    };

    const removeFromQueue = (id) => {
        setDeliveryQueue(deliveryQueue.filter(item => item._id !== id));
    };

    const handleEditClick = (challan) => {
        setEditingChallan(JSON.parse(JSON.stringify(challan)));
        setIsEditModalOpen(true);
    };

const handleConfirmDispatch = async () => {

    if (!deliveryInfo.vehicleNumber || !deliveryInfo.driverNumber) {
        return Swal.fire("Required", "Please fill Vehicle and Driver details", "warning");
    }

    if (deliveryQueue.length === 0) {
        return Swal.fire("Empty", "No challan selected", "warning");
    }

 const deliveryData = deliveryQueue.map(c => ({
    challanId: c._id.toString(), // 🔑 ObjectId to string
    vehicleNumber: deliveryInfo.vehicleNumber,
    vendorName: deliveryInfo.vendorName,
    vendorNumber: deliveryInfo.vendorNumber,
    driverName: deliveryInfo.driverName,
    driverNumber: deliveryInfo.driverNumber,

    customerName: c.customerName,
    zone: c.zone,
    address: c.address,
    thana: c.thana,
    district: c.district,
    receiverNumber: c.receiverNumber,

    products: c.products, 

    createdBy: role?.email || "unknown",
    createdAt: new Date()
}));

    try {

        const res = await axiosSecure.post("/deliveries", deliveryData);

        if (res.data.insertedCount > 0) {

            Swal.fire("Success", "Delivery Created Successfully 🚚", "success");

            setDeliveryQueue([]);

            setDeliveryInfo({
                vehicleNumber: "",
                vendorName: "",
                vendorNumber: "",
                driverName: "",
                driverNumber: ""
            });

        }

    } catch (error) {

        console.error(error);
        Swal.fire("Error", "Delivery failed", "error");

    }
};


    const handleVehicleSearch = async (e) => {

    const value = e.target.value;

    setDeliveryInfo(prev => ({
        ...prev,
        vehicleNumber: value
    }));

    if (value.length < 2) {
        setVehicleSuggestions([]);
        return;
    }

    try {

        const res = await axiosSecure.get(`/vehicles/search?search=${value}`);

        setVehicleSuggestions(res.data || []);

    } catch (error) {
        console.error(error);
    }
};


const handleSelectVehicle = (vehicle) => {

    setDeliveryInfo({
        vehicleNumber: vehicle.vehicleNumber,
        vendorName: vehicle.vendorName,
        vendorNumber: vehicle.vendorPhone,
        driverName: vehicle.driverName,
        driverNumber: vehicle.driverPhone
    });

    setVehicleSuggestions([]);
};
    return (
        <div className="min-h-screen bg-gray-100 p-2 md:p-6 font-sans">
            <div className="max-w-[1700px] mx-auto text-left">

                {/* --- Updated Header Section --- */}
                <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 border-l-8 border-green-600 transition-all">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="shrink-0">
                            <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">
                                Delivery <span className="text-green-600">Planner</span>
                            </h2>
                            <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                                Search Results: 
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md">{challans.length} Items</span>
                            </p>
                        </div>

                        {/* Input Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
                            {[
                                { label: "Vehicle Number", name: "vehicleNumber", placeholder: "e.g. DHAKA-METRO-123" },
                                { label: "Vendor Name", name: "vendorName", placeholder: "Company Name" },
                                { label: "Vendor Phone", name: "vendorNumber", placeholder: "01XXX-XXXXXX" },
                                { label: "Driver Name", name: "driverName", placeholder: "Full Name" },
                                { label: "Driver Phone", name: "driverNumber", placeholder: "01XXX-XXXXXX" },
                            ].map((field) => (
                                <div key={field.name} className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase ml-1">{field.label}</label>
                                   {field.name === "vehicleNumber" ? (

<div className="relative">

<input
    type="text"
    name="vehicleNumber"
    value={deliveryInfo.vehicleNumber}
    onChange={handleVehicleSearch}
    placeholder={field.placeholder}
    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-green-500 focus:bg-white transition-all"
/>

{vehicleSuggestions.length > 0 && (

<div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-lg z-50 max-h-60 overflow-auto">

{vehicleSuggestions.map((v,i)=>(

<div
key={i}
onClick={()=>handleSelectVehicle(v)}
className="p-2 hover:bg-green-100 cursor-pointer text-xs"
>

<p className="font-bold">{v.vehicleNumber}</p>
<p className="text-gray-500">{v.vendorName} | {v.driverName}</p>

</div>

))}

</div>

)}

</div>

) : (

<input
    type="text"
    name={field.name}
    value={deliveryInfo[field.name]}
    onChange={handleDeliveryInfoChange}
    placeholder={field.placeholder}
    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-green-500 focus:bg-white transition-all"
/>

)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Main Dashboard --- */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                    {/* LEFT SIDE: Available Challans */}
                    <div className="xl:col-span-4 space-y-4 max-h-[82vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-xs font-black text-gray-400 uppercase ml-1 text-left">
                            {searchText ? `Found for: "${searchText}"` : "Enter text in search bar to find challans"}
                        </p>

                        {loading ? (
                            <div className="p-10 text-center font-bold text-green-600 animate-pulse">Searching...</div>
                        ) : challans.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl text-center border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold uppercase text-xs">No Data to Display</p>
                            </div>
                        ) : (
                            challans.map((c) => (
                                <div key={c._id} className="bg-white rounded-2xl shadow-sm border-b-4 border-gray-200 hover:border-green-500 transition-all overflow-hidden text-left">
                                    <div className="bg-gray-800 p-3 text-white flex justify-between items-center">
                                        <span className="text-[10px] font-mono tracking-widest opacity-70 uppercase">#{c._id.slice(-6)}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditClick(c)} className="p-2 bg-gray-700 hover:bg-blue-600 rounded-lg transition">
                                                <FaUserEdit size={14} />
                                            </button>
                                            <button onClick={() => addToDelivery(c)} className="flex items-center gap-1 px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-black transition shadow-lg">
                                                <FaPlusCircle /> ADD
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-black text-blue-900 uppercase truncate mb-1">{c.customerName}</h3>
                                        <p className="text-[11px] text-green-700 font-bold uppercase mb-2 tracking-tighter">Zone: {c.zone}</p>
                                        <div className="space-y-1 mb-4 border-l-2 border-gray-100 pl-2 text-[11px] text-gray-500">
                                            <p className="whitespace-normal break-words leading-relaxed"><strong className="text-gray-700">Address:</strong> {c.address}</p>
                                            <p><strong className="text-gray-700">Thana:</strong> {c.thana}, <strong className="text-gray-700">District:</strong> {c.district}</p>
                                            <p className="font-bold italic"><strong className="text-gray-700 not-italic">Receiver:</strong> {c.receiverNumber}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                                            <table className="w-full text-[11px]">
                                                <thead>
                                                    <tr className="text-gray-400 uppercase font-black border-b border-gray-200">
                                                        <th className="pb-1 text-left">Model</th>
                                                        <th className="pb-1 text-right">Qty</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {c.products?.map((p, pIdx) => (
                                                        <tr key={pIdx}>
                                                            <td className="py-1.5 font-bold text-gray-700 uppercase break-all">{p.model}</td>
                                                            <td className="py-1.5 text-right font-black text-blue-600">{p.quantity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT SIDE: Delivery Queue */}
                    <div className="xl:col-span-8 bg-white rounded-3xl shadow-xl border border-gray-200 min-h-[70vh] flex flex-col overflow-hidden text-left">
                        <div className="bg-green-600 p-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight"><FaTruck /> Delivery Queue</h3>
                                <p className="text-[10px] font-bold opacity-80 uppercase">Prepare these challans for final delivery</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{deliveryQueue.length} Selected</span>
                                {deliveryQueue.length > 0 && (
                                    <button onClick={() => setDeliveryQueue([])} className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-black transition">CLEAR</button>
                                )}
                            </div>
                        </div>

                        <div className="p-6 flex-grow overflow-y-auto max-h-[65vh] bg-gray-50/50">
                            {deliveryQueue.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                    <FaTruck size={100} />
                                    <p className="text-2xl font-black mt-4">Queue is empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {deliveryQueue.map((item) => (
                                        <div key={item._id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 relative shadow-sm hover:shadow-md transition-shadow">
                                            <button onClick={() => removeFromQueue(item._id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition"><FaTimes size={20} /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                <div className="md:col-span-5 border-r border-gray-100 pr-4">
                                                    <h4 className="text-lg font-black text-blue-900 uppercase leading-none mb-2">{item.customerName}</h4>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <p>Address: {item.address}, {item.thana}, {item.district}</p>
                                                        <p className="font-bold flex items-center gap-2"><FaPhoneAlt className="text-green-600" /> {item.receiverNumber}</p>
                                                        <p className="mt-2 inline-block bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Zone: {item.zone}</p>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-7">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Product Details</p>
                                                    <div className="bg-gray-50 rounded-xl overflow-hidden">
                                                        <table className="w-full text-left text-xs">
                                                            <thead className="bg-gray-100 text-gray-500 font-bold uppercase">
                                                                <tr>
                                                                    <th className="p-2">Model</th>
                                                                    <th className="p-2 text-center">Qty</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {item.products?.map((p, pIdx) => (
                                                                    <tr key={pIdx} className="border-b border-gray-200/50">
                                                                        <td className="p-2 font-bold text-gray-700">{p.model}</td>
                                                                        <td className="p-2 text-center"><span className="font-black text-green-600">{p.quantity} PCS</span></td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {deliveryQueue.length > 0 && (
                            <div className="p-6 bg-white border-t-2 border-gray-100">
                                <button 
                                    onClick={handleConfirmDispatch}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-4 transition-transform active:scale-95 uppercase tracking-tighter"
                                >
                                    Confirm Dispatch & Print Challan <FaTruck size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Edit Modal --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
                         <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
                            <h3 className="font-black uppercase tracking-widest">Edit Challan Details</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white"><FaTimes size={20}/></button>
                         </div>
                         <div className="p-6">
                            <p className="text-center text-gray-400 py-10 font-bold">Edit Fields logic goes here...</p>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
                            > Close </button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateDelivery;