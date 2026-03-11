import React from "react";

const TripDetailsModal = ({ selectedTrip, setSelectedTrip }) => {

    if (!selectedTrip) return null;

    // Total Product Qty
    const totalProducts = selectedTrip.challans.reduce((sum, c) => {
        const qty = c.products.reduce((pSum, p) => pSum + Number(p.quantity), 0);
        return sum + qty;
    }, 0);

    const date = new Date(selectedTrip.createdAt).toLocaleDateString();

    return (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white w-[1000px] max-h-[90vh] overflow-y-auto rounded-xl p-6">

                {/* Header */}

                <div className="flex justify-between items-start border-b pb-4 mb-6">

                    <div>

                        <h2 className="text-xl font-bold text-green-700">
                            Trip {selectedTrip.tripNumber}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Date: {date}
                        </p>

                        <div className="flex gap-3 mt-2 text-sm">

                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                                Total Challan: {selectedTrip.totalChallan}
                            </span>

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
                                Total Products: {totalProducts} PCS
                            </span>

                        </div>

                    </div>

                    <button
                        onClick={() => setSelectedTrip(null)}
                        className="text-red-500 font-bold"
                    >
                        Close
                    </button>

                </div>


                {/* Vehicle + Vendor + Driver */}

                <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">

                    <div className="border rounded-lg p-3 bg-gray-50">
                        <p className="font-semibold text-gray-600">Vehicle</p>
                        <p className="font-bold">{selectedTrip.vehicleNumber}</p>
                    </div>

                    <div className="border rounded-lg p-3 bg-gray-50">
                        <p className="font-semibold text-gray-600">Vendor</p>
                        <p className="font-bold">{selectedTrip.vendorName}</p>
                        <p className="text-gray-500">{selectedTrip.vendorNumber}</p>
                    </div>

                    <div className="border rounded-lg p-3 bg-gray-50">
                        <p className="font-semibold text-gray-600">Driver</p>
                        <p className="font-bold">{selectedTrip.driverName}</p>
                        <p className="text-gray-500">{selectedTrip.driverNumber}</p>
                    </div>

                </div>


                {/* Challan Cards */}

                <div className="grid md:grid-cols-2 gap-4">

                    {selectedTrip.challans.map((c, i) => (

                        <div
                            key={i}
                            className="border rounded-lg p-4 shadow-sm bg-gray-50"
                        >

                            {/* Customer */}

                            <div className="mb-2">

                                <h3 className="font-bold text-gray-800">
                                    {c.customerName}
                                </h3>

                                <p className="text-xs text-blue-600 font-semibold">
                                    Zone: {c.zone}
                                </p>

                            </div>


                            {/* Address */}

                            <div className="text-sm text-gray-600 mb-3">

                                <p>{c.address}</p>

                                <p>
                                    {c.thana}, {c.district}
                                </p>

                                <p className="text-gray-500 text-xs mt-1">
                                    Receiver: {c.receiverNumber}
                                </p>

                            </div>


                            {/* Products */}

                            <div className="border-t pt-2">

                                <p className="text-xs font-semibold text-gray-500 mb-1">
                                    Products
                                </p>

                                {c.products.map((p, idx) => (

                                    <div
                                        key={idx}
                                        className="flex justify-between text-sm py-1"
                                    >

                                        <span className="font-medium uppercase">
                                            {p.model}
                                        </span>

                                        <span className="font-bold text-green-600">
                                            {p.quantity} PCS
                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );
};

export default TripDetailsModal;