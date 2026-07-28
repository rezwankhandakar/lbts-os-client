/* ══════════════════════════════════════════════════════════════════
   Shared image upload helper (/upload-image)
   ──────────────────────────────────────────────────────────────────
   কেন এই helper:
     আগে VendorDetails / AllVendor / AddVendor / Profile / Register —
     প্রতিটা জায়গায় আলাদা করে upload করা হতো এবং catch block-এ আসল
     server error গিলে ফেলে সবসময় generic "Image upload failed"
     দেখানো হতো। ফলে আসল কারণ (HEIC format, 5MB-এর বড় ফাইল,
     hosting service block, rate limit) user কখনো দেখতে পেত না।

   এই helper যা করে:
     ১. Upload-এর আগে client-side validate (type + size)
     ২. বড় ছবি হলে browser-এই downscale করে পাঠায় — phone-এর
        8–12MB ছবিও তাই "too large" না বলে upload হয়ে যায়
     ৩. Fail করলে server-এর আসল message নিয়ে Error throw করে,
        caller-এর catch-এ err.message সোজা user-কে দেখানো যায়
══════════════════════════════════════════════════════════════════ */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // server-এর multer limit-এর সাথে sync
const MAX_DIMENSION = 1600;       // এর চেয়ে বড় হলে downscale
const SHRINK_ABOVE = 1.5 * 1024 * 1024;

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
  return null;
};

/**
 * বড় ছবি canvas দিয়ে ছোট করে। যেকোনো কারণে fail করলে (browser
 * support, corrupt file) চুপচাপ আসল file-টাই ফেরত দেয় — কখনো throw
 * করে না, তাই এটা upload কে ভাঙতে পারবে না।
 */
export const shrinkImage = async (file) => {
  const needsShrink = file.size > SHRINK_ABOVE;
  if (!needsShrink || typeof document === "undefined") return file;

  try {
    const bitmapUrl = URL.createObjectURL(file);
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = bitmapUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    // ছোট dimension কিন্তু ভারী ফাইল হলেও re-encode করলে size কমে,
    // তাই scale === 1 হলেও এগিয়ে যাই।
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    // PNG-র transparency JPEG-এ কালো হয়ে যায় — তাই PNG থাকলে PNG-ই
    // রাখি, শুধু dimension কমাই।
    const keepPng = file.type === "image/png";
    if (!keepPng) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(bitmapUrl);

    const mime = keepPng ? "image/png" : "image/jpeg";
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, mime, keepPng ? undefined : 0.85)
    );
    if (!blob || blob.size >= file.size) return file; // লাভ না হলে আসলটাই

    const name = (file.name || "photo").replace(/\.[^.]+$/, "") + (keepPng ? ".png" : ".jpg");
    return new File([blob], name, { type: mime });
  } catch {
    return file;
  }
};

/**
 * Validate + (দরকার হলে) shrink + upload। সফল হলে hosted URL,
 * fail হলে user-কে দেখানোর মতো message-সহ Error throw।
 *
 * @param client  axiosSecure, বা `.post(path, body, config)` আছে এমন যেকোনো object
 * @param file    File object
 * @param options { headers } — Register page-এ Firebase idToken পাঠানোর জন্য
 */
export const uploadImage = async (client, file, options = {}) => {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);

  const payloadFile = await shrinkImage(file);
  if (payloadFile.size > MAX_SIZE) {
    throw new Error(
      `Image too large (${(payloadFile.size / 1024 / 1024).toFixed(1)} MB) — maximum 5 MB`
    );
  }

  const fd = new FormData();
  fd.append("image", payloadFile);
  try {
    const res = await client.post("/upload-image", fd, {
      headers: { "Content-Type": "multipart/form-data", ...(options.headers || {}) },
      timeout: 45000, // shrink করার পরেও ধীর network-এ সময় লাগে
    });
    if (!res.data?.success || !res.data?.url) {
      throw new Error(res.data?.message || "Image upload failed");
    }
    return res.data.url;
  } catch (err) {
    // Server-এর আসল message surface করো (429 rate-limit, 400 format,
    // 502 hosting-block ইত্যাদি)
    const msg =
      err?.response?.data?.message ||
      (err?.code === "ECONNABORTED" ? "Upload timed out — check your internet connection" : "") ||
      err?.message ||
      "Image upload failed";
    throw new Error(msg);
  }
};