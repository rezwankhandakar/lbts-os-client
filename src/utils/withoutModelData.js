// ════════════════════════════════════════════════════════════════════════
// Without-Model Rate Data — auto-generated from Without_Model.xlsx
// ────────────────────────────────────────────────────────────────────────
// Items here do NOT need a model match — product name + location is enough.
// A few items have a capacity variant (Gas Stove single/Double, Air Cooler,
// Weight Machine).  For those, capacity is selected manually on the Delivered
// page, then rate is looked up by product + capacity + location.
// ════════════════════════════════════════════════════════════════════════

export const WITHOUT_MODEL_DATA = [
  { product: "Pedal Stand Fan", capacity: null, "ISD": 145, "OSD-Metro": 180, "OSD-Thana": 180 },
  { product: "Wall Fan", capacity: null, "ISD": 95, "OSD-Metro": 120, "OSD-Thana": 155 },
  { product: "Table Fan", capacity: null, "ISD": 95, "OSD-Metro": 120, "OSD-Thana": 155 },
  { product: "Non Recharagable", capacity: null, "ISD": 95, "OSD-Metro": 120, "OSD-Thana": 155 },
  { product: "Rechargable", capacity: null, "ISD": 95, "OSD-Metro": 120, "OSD-Thana": 155 },
  { product: "Ceiling Fan", capacity: null, "ISD": 90, "OSD-Metro": 120, "OSD-Thana": 145 },
  { product: "Tornado Fan", capacity: null, "ISD": 90, "OSD-Metro": 120, "OSD-Thana": 145 },
  { product: "Exhaust Fan", capacity: null, "ISD": 40, "OSD-Metro": 50, "OSD-Thana": 50 },
  { product: "Bulb", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Light", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Infrared Cooker", capacity: null, "ISD": 96, "OSD-Metro": 120, "OSD-Thana": 144 },
  { product: "Induction Cooker", capacity: null, "ISD": 96, "OSD-Metro": 120, "OSD-Thana": 144 },
  { product: "Gas Stove", capacity: "single", "ISD": 96, "OSD-Metro": 120, "OSD-Thana": 144 },
  { product: "Gas Stove", capacity: "Double", "ISD": 132, "OSD-Metro": 168, "OSD-Thana": 180 },
  { product: "Weight Machine", capacity: "Upto 40Kg", "ISD": 78, "OSD-Metro": 108, "OSD-Thana": 120 },
  { product: "Coffee Maker", capacity: null, "ISD": 70, "OSD-Metro": 80, "OSD-Thana": 90 },
  { product: "Toasters", capacity: null, "ISD": 65, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Sandwich Maker", capacity: null, "ISD": 65, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Rice Cooker", capacity: null, "ISD": 70, "OSD-Metro": 80, "OSD-Thana": 90 },
  { product: "Pressure cooker", capacity: null, "ISD": 70, "OSD-Metro": 80, "OSD-Thana": 90 },
  { product: "Kitchen Hood", capacity: null, "ISD": 350, "OSD-Metro": 450, "OSD-Thana": 550 },
  { product: "Room heater", capacity: null, "ISD": 350, "OSD-Metro": 450, "OSD-Thana": 550 },

  { product: "Gyser", capacity: null, "ISD": 240, "OSD-Metro": 300, "OSD-Thana": 336 },
  { product: "Vacuum Cleaner", capacity: null, "ISD": 240, "OSD-Metro": 300, "OSD-Thana": 336 },
  { product: "Air Cooler", capacity: "11-18 Litre", "ISD": 180, "OSD-Metro": 240, "OSD-Thana": 300 },
  { product: "Air Cooler", capacity: "19-30 Litre", "ISD": 216, "OSD-Metro": 300, "OSD-Thana": 384 },
  { product: "Hair Dryer", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Hair Styler", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Shaver", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Trimmer", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Grooming Kit", capacity: null, "ISD": 60, "OSD-Metro": 70, "OSD-Thana": 80 },
  { product: "Blender", capacity: null, "ISD": 90, "OSD-Metro": 114, "OSD-Thana": 120 },
  { product: "Juicer", capacity: null, "ISD": 90, "OSD-Metro": 114, "OSD-Thana": 120 },
  { product: "Grinder", capacity: null, "ISD": 90, "OSD-Metro": 114, "OSD-Thana": 120 },
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