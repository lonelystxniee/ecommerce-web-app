import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ sticky }) => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    // Debouncing logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                // Optional: you could show a preview here
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className={`${sticky ? "flex" : "hidden lg:flex"} flex-1 relative group`}
        >
            <div
                className="flex flex-1 px-px py-px overflow-hidden bg-white border-y border-secondary relative
        before:bg-[url('https://honglam.vn/_next/static/media/bg-search-left.56be37b9.png')]
        before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:w-3 before:bg-no-repeat before:bg-contain
        after:bg-[url('https://honglam.vn/_next/static/media/bg-search-right.02ad1c3a.png')]
        after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0 after:w-3 after:bg-no-repeat after:bg-contain
      "
            >
                <div className="flex items-center justify-center gap-3 px-6 text-sm cursor-pointer text-primary">
                    <span className="font-semibold">Tất cả</span>
                    <ChevronDown className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Từ khóa tìm kiếm..."
                    className="flex-1 px-4 text-sm font-semibold outline-none h-9 placeholder:text-primary text-primary"
                />
                <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 mr-2 text-sm font-semibold rounded-md bg-secondary text-primary hover:bg-[#e09e2e] transition-colors"
                >
                    <Search size={14} strokeWidth={3} /> Tìm kiếm
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
