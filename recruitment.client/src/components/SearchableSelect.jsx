import { useState, useRef, useEffect } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";

const SearchableSelect = ({
  label,
  icon,
  options,
  value,
  onChange,
  name,
  placeholder = "Select an option...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Find the label for the currently selected value
  const selectedOption = options.find((opt) => opt.code === value);

  const handleSelect = (code) => {
    onChange({ target: { name, value: code } });
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
        {label}
      </label>

      <div className="relative group">
        {/* --- THE TRIGGER BOX --- */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full ${icon ? "pl-10" : "px-4"} pr-10 py-2.5 bg-gray-50/50 border ${
            isOpen ? "border-red-500 ring-4 ring-red-500/10" : "border-gray-100"
          } rounded-xl transition-all font-medium text-sm cursor-pointer flex items-center justify-between`}
        >
          {icon && (
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isOpen ? "text-red-600" : "text-gray-400"
              }`}
            >
              {icon}
            </div>
          )}

          <span
            className={`truncate ${selectedOption ? "text-gray-700" : "text-gray-400"}`}
          >
            {selectedOption ? selectedOption.description : placeholder}
          </span>

          <FaChevronDown
            className={`text-[10px] transition-transform duration-300 ${
              isOpen ? "rotate-180 text-red-600" : "text-gray-400"
            }`}
          />
        </div>

        {/* --- DROPDOWN MENU --- */}
        {isOpen && (
          <div className="absolute z-[100] w-full mt-1.5 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input inside dropdown */}
            <div className="p-2 border-b border-gray-50 bg-gray-50/30">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to filter..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-100 rounded-lg outline-none text-xs focus:ring-2 focus:ring-red-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Options List */}
            <ul className="max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <li
                    key={opt.code}
                    onClick={() => handleSelect(opt.code)}
                    className={`px-4 py-2.5 text-xs md:text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      value === opt.code
                        ? "bg-red-50 text-red-600 font-bold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{opt.description}</span>
                    {value === opt.code && (
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    )}
                  </li>
                ))
              ) : (
                <li className="px-4 py-6 text-center text-gray-400 text-xs italic">
                  No matching results
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;
