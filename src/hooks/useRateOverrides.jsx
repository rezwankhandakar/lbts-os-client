// ════════════════════════════════════════════════════════════════════════
// useRateOverrides — app boot-এ একবার custom rate table টেনে আনে
// ────────────────────────────────────────────────────────────────────────
// RootLayout থেকে একবার call করা হয়। GET /rate-table থেকে admin-যোগ করা
// product/model row গুলো এনে rateStore-এ বসায়, ফলে rateMatcher.findRate()
// (AddChallan, Deliverd, CreateDelivery, TripDetails, সব modal) নতুন
// product গুলো চিনতে পারে — কোনো code edit বা redeploy লাগে না।
//
// ব্যর্থ হলে চুপচাপ baseline table-এ পড়ে থাকে (withModelData.js /
// withoutModelData.js) — অর্থাৎ আগের behaviour, কিছুই ভাঙে না।
//
// Cache key 'rate-overrides' — Product Rates page save করার পর
// queryClient.invalidateQueries({ queryKey: ['rate-overrides'] }) দিলেই
// সব page সাথে সাথে নতুন rate পেয়ে যায়।
// ════════════════════════════════════════════════════════════════════════

import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import useRole from "./useRole";
import { setRateOverrides } from "../utils/rateStore";

export const RATE_OVERRIDES_KEY = ["rate-overrides"];

const useRateOverrides = () => {
  const axiosSecure = useAxiosSecure();
  const { role, status } = useRole();

  // Approved user না হলে endpoint 403 দেবে — তাই আগে গেট
  const enabled = !!role && status === "approved";

  return useQuery({
    queryKey: RATE_OVERRIDES_KEY,
    enabled,
    staleTime: 5 * 60 * 1000,   // ৫ মিনিট — rate খুব ঘনঘন বদলায় না
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axiosSecure.get("/rate-table");
      setRateOverrides({
        withModel: res.data?.custom?.withModel || [],
        withoutModel: res.data?.custom?.withoutModel || [],
      });
      return res.data;
    },
  });
};

export default useRateOverrides;