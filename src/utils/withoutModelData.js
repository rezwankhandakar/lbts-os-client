// ════════════════════════════════════════════════════════════════════════
// Without-Model Rate Data — auto-generated from Without_Model.xlsx
// ────────────────────────────────────────────────────────────────────────
// Items here do NOT need a model match — product name + location is enough.
// A few items have a capacity variant (Gas Stove single/Double, Air Cooler,
// Weight Machine).  For those, capacity is selected manually on the Delivered
// page, then rate is looked up by product + capacity + location.
// ════════════════════════════════════════════════════════════════════════

export const WITHOUT_MODEL_DATA = [
  { product: "Pedal Stand Fan", capacity: null, "ISD": 120, "OSD-Metro": 150, "OSD-Thana": 150 },
  { product: "Wall Fan", capacity: null, "ISD": 80, "OSD-Metro": 100, "OSD-Thana": 130 },
  { product: "Table Fan", capacity: null, "ISD": 80, "OSD-Metro": 100, "OSD-Thana": 130 },
  { product: "Non Recharagable", capacity: null, "ISD": 80, "OSD-Metro": 100, "OSD-Thana": 130 },
  { product: "Rechargable", capacity: null, "ISD": 80, "OSD-Metro": 100, "OSD-Thana": 130 },
  { product: "Ceiling Fan", capacity: null, "ISD": 75, "OSD-Metro": 100, "OSD-Thana": 120 },
  { product: "Tornado Fan", capacity: null, "ISD": 75, "OSD-Metro": 100, "OSD-Thana": 120 },
  { product: "Exhaust Fan", capacity: null, "ISD": 40, "OSD-Metro": 50, "OSD-Thana": 50 },
  { product: "Bulb", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Light", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Infrared Cooker", capacity: null, "ISD": 80, "OSD-Metro": 100, "OSD-Thana": 120 },
  { product: "Induction Cooker", capacity: null, "ISD": 80, "OSD-Metro": 100, "OSD-Thana": 120 },
  { product: "Gas Stove", capacity: "single", "ISD": 80, "OSD-Metro": 100, "OSD-Thana": 120 },
  { product: "Gas Stove", capacity: "Double", "ISD": 110, "OSD-Metro": 140, "OSD-Thana": 150 },
  { product: "Weight Machine", capacity: "Upto 40Kg", "ISD": 65, "OSD-Metro": 90, "OSD-Thana": 100 },
  { product: "Coffee Maker", capacity: null, "ISD": 70, "OSD-Metro": 80, "OSD-Thana": 90 },
  { product: "Toasters", capacity: null, "ISD": 65, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Sandwich Maker", capacity: null, "ISD": 65, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Rice Cooker", capacity: null, "ISD": 70, "OSD-Metro": 80, "OSD-Thana": 90 },
  { product: "Pressure cooker", capacity: null, "ISD": 70, "OSD-Metro": 80, "OSD-Thana": 90 },
  { product: "Kitchen Hood", capacity: null, "ISD": 350, "OSD-Metro": 450, "OSD-Thana": 550 },
  { product: "Room heater", capacity: null, "ISD": 350, "OSD-Metro": 450, "OSD-Thana": 550 },
  { product: "Gyser", capacity: null, "ISD": 200, "OSD-Metro": 250, "OSD-Thana": 280 },
  { product: "Vacuum Cleaner", capacity: null, "ISD": 200, "OSD-Metro": 250, "OSD-Thana": 280 },
  { product: "Air Cooler", capacity: "11-18 Litre", "ISD": 150, "OSD-Metro": 200, "OSD-Thana": 250 },
  { product: "Air Cooler", capacity: "19-30 Litre", "ISD": 180, "OSD-Metro": 250, "OSD-Thana": 320 },
  { product: "Hair Dryer", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Hair Styler", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Shaver", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Trimmer", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Grooming Kit", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Blender", capacity: null, "ISD": 75, "OSD-Metro": 95, "OSD-Thana": 100 },
  { product: "Juicer", capacity: null, "ISD": 75, "OSD-Metro": 95, "OSD-Thana": 100 },
  { product: "Grinder", capacity: null, "ISD": 75, "OSD-Metro": 95, "OSD-Thana": 100 },
];

// Unique product names — used for product-name typeahead suggestions
export const WITHOUT_MODEL_PRODUCTS = [
  "Pedal Stand Fan",
  "Wall Fan",
  "Table Fan",
  "Non Recharagable",
  "Rechargable",
  "Ceiling Fan",
  "Tornado Fan",
  "Exhaust Fan",
  "Bulb",
  "Light",
  "Infrared Cooker",
  "Induction Cooker",
  "Gas Stove",
  "Weight Machine",
  "Coffee Maker",
  "Toasters",
  "Sandwich Maker",
  "Rice Cooker",
  "Pressure cooker",
  "Kitchen Hood",
  "Room heater",
  "Gyser",
  "Vacuum Cleaner",
  "Air Cooler",
  "Hair Dryer",
  "Hair Styler",
  "Shaver",
  "Trimmer",
  "Grooming Kit",
  "Blender",
  "Juicer",
  "Grinder"
];

// Products that have selectable capacity variants (no model, but capacity matters).
// Used on the Delivered page to show a capacity-suggestion list.
export const WITHOUT_MODEL_CAPACITY_BY_PRODUCT = {
  "Gas Stove": ["single", "Double"],
  "Weight Machine": ["Upto 40Kg"],
  "Air Cooler": ["11-18 Litre", "19-30 Litre"],
};