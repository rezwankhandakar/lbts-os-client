/* ══════════════════════════════════════════════════════════════════
   Shared image upload helper (/upload-image)
   ──────────────────────────────────────────────────────────────────
   আগে VendorDetails / AllVendor-এর প্রতিটা handler-এ আলাদা করে
   upload করা হতো এবং catch block-এ আসল server error গিলে ফেলে
   সবসময় generic "Image upload failed" দেখানো হতো — ফলে আসল কারণ
   (HEIC format, 5MB-এর বড় ফাইল, imgbb key সমস্যা, rate limit) কখনোই
   user দেখতে পেত না। এই helper:

   ১. Upload-এর আগেই client-side validate করে (type + size) — ভুল
      ফাইল হলে server-এ request-ই যায় না, সাথে সাথে পরিষ্কার message
   ২. Fail করলে server-এর আসল message নিয়ে Error throw করে —
      caller-এর catch block-এ err.message-ই user-কে দেখানোর মতো
══════════════════════════════════════════════════════════════════ */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // server-এর multer limit-এর সাথে sync

/** Upload-এর আগে ফাইল validate — সমস্যা থাকলে message string, নাহলে null */
export const validateImageFile = (file) => {
  if (!file) return "No file selected";
  if (!ALLOWED_TYPES.includes(file.type)) {
    // Phone camera-র HEIC/HEIF সবচেয়ে common culprit
    const isHeic = /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name || "");
    return isHeic
      ? "HEIC photos are not supported — please convert to JPEG/PNG first (phone camera settings → 'Most Compatible')"
      : `Only JPEG, PNG or WEBP images are allowed (got: ${file.type || "unknown"})`;
  }
  if (file.size > MAX_SIZE) {
    return `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB) — maximum 5 MB`;
  }
  return null;
};

/**
 * Validate + upload। সফল হলে hosted URL return করে,
 * fail হলে user-কে দেখানোর মতো message-সহ Error throw করে।
 */
export const uploadImage = async (axiosSecure, file) => {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  const fd = new FormData();
  fd.append("image", file);
  try {
    const res = await axiosSecure.post("/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
    if (!res.data?.success || !res.data?.url) {
      throw new Error(res.data?.message || "Image upload failed");
    }
    return res.data.url;
  } catch (err) {
    // Server-এর আসল message surface করো (429 rate-limit, 400 format,
    // 500 "Image service not configured" ইত্যাদি)
    const msg =
      err?.response?.data?.message ||
      (err?.code === "ECONNABORTED" ? "Upload timed out — check your internet connection" : "") ||
      err?.message ||
      "Image upload failed";
    throw new Error(msg);
  }
};