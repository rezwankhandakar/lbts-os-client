import { createContext, useState, useContext, useEffect, useRef, useCallback } from "react";

const SearchInputContext = createContext();
const SearchValueContext = createContext();

export const SearchProvider = ({ children }) => {
  const [rawText,       setRawText]       = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [isCleared,     setIsCleared]     = useState(false); // navigate হলে true → consumer empty দেখে
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!rawText) {
      setDebouncedText("");
      return;
    }
    setIsCleared(false); // টাইপ শুরু হলে cleared flag সরাও
    debounceRef.current = setTimeout(() => setDebouncedText(rawText), 350);
    return () => clearTimeout(debounceRef.current);
  }, [rawText]);

  // page navigate করলে এটা call হয় — সাথে সাথে সব clear
  // isCleared=true করলে consumer page গুলো "" পায় — পুরনো search ধরে রাখে না
  const resetSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setRawText("");
    setDebouncedText("");
    setIsCleared(true);
    // next render-এ isCleared false করো (শুধু transition-এর জন্য)
    setTimeout(() => setIsCleared(false), 0);
  }, []);

  return (
    <SearchInputContext.Provider value={{ rawText, setRawText, resetSearch }}>
      <SearchValueContext.Provider value={{
        searchText: isCleared ? "" : debouncedText,
        setSearchText: resetSearch,
      }}>
        {children}
      </SearchValueContext.Provider>
    </SearchInputContext.Provider>
  );
};

export const useSearchInput = () => useContext(SearchInputContext);
export const useSearch      = () => useContext(SearchValueContext);