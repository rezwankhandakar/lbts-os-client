// ═══════════════════════════════════════════════════════════════════
// exportHelpers.js — Excel & CSV export utilities (FIX #50)
// ═══════════════════════════════════════════════════════════════════
//
// Uses SheetJS (xlsx) — already installed in package.json.
// Functions:
//   - exportToExcel(data, filename, sheetName)
//   - exportChallansToExcel(challans, month, year)
//   - exportGatePassesToExcel(passes, month, year)
//   - exportDeliveriesToExcel(trips, month, year)
//   - exportAccountsToExcel(transactions, month, year)
// ═══════════════════════════════════════════════════════════════════

import * as XLSX from "xlsx";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Generic Excel export from flat array of objects.
 * @param {Array<object>} rows - Data rows
 * @param {string} filename - Output file name (without extension)
 * @param {string} sheetName - Sheet tab name
 */
export function exportToExcel(rows, filename = "export", sheetName = "Sheet1") {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("No data to export");
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export challans with flattened product rows.
 * One row per (challan × product).
 */
export function exportChallansToExcel(challans, month, year) {
  const rows = [];
  challans.forEach((c) => {
    const base = {
      "Date": c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB") : "",
      "Customer": c.customerName || "",
      "Address": c.address || "",
      "Thana": c.thana || "",
      "District": c.district || "",
      "Zone": c.zone || "",
      "Receiver": c.receiverNumber || "",
      "Status": c.status || "pending",
      "Trip #": c.tripNumber || "",
    };
    const products = c.products && c.products.length > 0 ? c.products : [{}];
    products.forEach((p) => {
      rows.push({
        ...base,
        "Product": p.productName || "",
        "Model": p.model || "",
        "Quantity": p.quantity || 0,
      });
    });
  });

  const label = month && year ? `${MONTH_NAMES[month - 1]}_${year}` : new Date().toISOString().slice(0, 10);
  exportToExcel(rows, `Challans_${label}`, "Challans");
}

/**
 * Export gate passes with flattened product rows.
 */
export function exportGatePassesToExcel(passes, month, year) {
  const rows = [];
  passes.forEach((g) => {
    const base = {
      "Date": g.tripDate ? new Date(g.tripDate).toLocaleDateString("en-GB") : "",
      "Trip DO": g.tripDo || "",
      "Customer": g.customerName || "",
      "CSD": g.csd || "",
      "Unit": g.unit || "",
      "Vehicle": g.vehicleNo || "",
      "Zone": g.zone || "",
    };
    const products = g.products && g.products.length > 0 ? g.products : [{}];
    products.forEach((p) => {
      rows.push({
        ...base,
        "Product": p.productName || "",
        "Model": p.model || "",
        "Quantity": p.quantity || 0,
      });
    });
  });
  const label = month && year ? `${MONTH_NAMES[month - 1]}_${year}` : new Date().toISOString().slice(0, 10);
  exportToExcel(rows, `GatePass_${label}`, "Gate Passes");
}

/**
 * Export delivery trips — summary per trip.
 */
export function exportDeliveriesToExcel(trips, month, year) {
  const rows = trips.map((t) => ({
    "Trip #": t.tripNumber || "",
    "Date": t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB") : "",
    "Vendor": t.vendorName || "",
    "Vehicle": t.vehicleNumber || "",
    "Driver": t.driverName || "",
    "Driver #": t.driverNumber || "",
    "Total Challans": t.totalChallan || (t.challans?.length ?? 0),
    "Rent": t.rent || 0,
    "Labor Bill": t.leborBill || 0,
    "Advance": t.advance || 0,
    "Net Payable": (Number(t.rent) || 0) + (Number(t.leborBill) || 0) - (Number(t.advance) || 0),
  }));
  const label = month && year ? `${MONTH_NAMES[month - 1]}_${year}` : new Date().toISOString().slice(0, 10);
  exportToExcel(rows, `Deliveries_${label}`, "Trips");
}

/**
 * Export accounts transactions.
 */
export function exportAccountsToExcel(transactions, month, year) {
  const rows = transactions.map((t) => ({
    "Date": t.date ? new Date(t.date).toLocaleDateString("en-GB") : "",
    "Type": t.type || "",
    "Description": t.description || "",
    "Amount": Number(t.amount) || 0,
    "Vendor": t.vendorName || "",
    "Recipient": t.recipientName || "",
    "Note": t.note || "",
    "Status": t.status || "",
    "Created By": t.createdBy || "",
  }));
  const label = month && year ? `${MONTH_NAMES[month - 1]}_${year}` : new Date().toISOString().slice(0, 10);
  exportToExcel(rows, `Accounts_${label}`, "Transactions");
}

/**
 * Export generic CSV (alternative to xlsx).
 */
export function exportToCSV(rows, filename = "export") {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("No data to export");
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}