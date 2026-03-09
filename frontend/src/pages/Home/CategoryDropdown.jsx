import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { MenuItem } from "./Hero";

export const CategoryDropdown = ({ display, categories }) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleDropdown = () => {
    if (!open) {
      setMounted(true);
      requestAnimationFrame(() => setOpen(true));
    } else {
      setOpen(false);
      setTimeout(() => setMounted(false), 300);
    }
  };

  return (
    <div
      className={`${display ? "flex" : "md:hidden"} relative flex items-center justify-between bg-primary h-12 self-start p-4 w-full cursor-pointer
        before:content-[''] before:absolute before:bg-transparent before:border before:border-[#d44546] 
        before:top-1/2 before:left-1/2 before:-translate-1/2 before:w-[calc(100%-8px)] before:h-[calc(100%-8px)] before:z-1 
    `}
      onClick={handleDropdown}
    >
      <div className="flex items-center gap-3">
        <Menu className="w-4 h-4 text-[#dfdfdf]" />
        <p className="font-medium text-white">Danh mục sản phẩm</p>
      </div>

      <ChevronDown className="w-4 h-4 text-white" />

      {mounted && (
        <div
          className={`absolute left-0 top-full w-full bg-primary z-99
            transition-all duration-300 ease-out max-h-100 overflow-y-auto custom-scrollbar
            ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
          `}
        >
          <MenuItem categories={categories} />
        </div>
      )}
    </div>
  );
};
