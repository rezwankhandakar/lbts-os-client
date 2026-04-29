// useAutoComplete.js
// সমস্যা (আগে): একই "ঢাকা" টাইপ করলে বারবার API call হতো
// সমাধান (এখন):
//   - Module-level cache → page reload না হওয়া পর্যন্ত result মনে থাকে
//   - Cache hit হলে 0ms, কোনো API call নেই
//   - 400ms debounce built-in
//   - AbortController → stale/পুরনো request cancel হয়

import { useState, useRef, useCallback, useEffect } from "react";

// সব component share করে এই cache — "challan|zone|ঢাকা" → [{value:...}]
const autoCache = new Map();
const MAX_CACHE_SIZE = 200;

function getCacheKey(collection, field, search) {
  return `${collection}|${field}|${search.trim().toLowerCase()}`;
}

function setCache(key, data) {
  if (autoCache.size >= MAX_CACHE_SIZE) {
    autoCache.delete(autoCache.keys().next().value);
  }
  autoCache.set(key, data);
}

const useAutoComplete = (axiosSecure, collection = "challan") => {
  const [autoData,    setAutoData]    = useState({});
  const [activeField, setActiveField] = useState(null);
  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleAutoSearch = useCallback((fieldKey, field, value) => {
    if (!value || !value.trim()) { setActiveField(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const cacheKey = getCacheKey(collection, field, value);

      // Cache hit → instant, no API call
      if (autoCache.has(cacheKey)) {
        setAutoData(prev => ({ ...prev, [fieldKey]: autoCache.get(cacheKey) }));
        setActiveField(fieldKey);
        return;
      }

      // Cache miss → API call, পুরনো request cancel করো
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await axiosSecure.get(
          `/autocomplete?collection=${collection}&field=${field}&search=${encodeURIComponent(value.trim())}`,
          { signal: abortRef.current.signal }
        );
        const data = res.data || [];
        setCache(cacheKey, data);
        setAutoData(prev => ({ ...prev, [fieldKey]: data }));
        setActiveField(fieldKey);
      } catch (err) {
        if (err?.code === "ERR_CANCELED" || err?.name === "AbortError") return;
        console.error("Autocomplete error:", err);
      }
    }, 400);
  }, [axiosSecure, collection]);

  return { autoData, activeField, setActiveField, handleAutoSearch };
};

export default useAutoComplete;