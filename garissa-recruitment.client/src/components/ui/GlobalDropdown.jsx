import React, { useEffect, useState, useRef } from "react";
import { IconChevronDown, IconSearch, IconX, IconLoader2 } from "@tabler/icons-react";

const GlobalDropdown = ({
  page,
  code = "Code",
  description = "Description",
  filters = {},
  label,
  name,
  value = "",
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = "",
  error,
  searchable = true, 
  multiple = false,
  merge = 1,
  source = "OData", 
  type = ""         
}) => {
  const [selectedOption, setSelectedOption] = useState(
    typeof value === "string" ? value : ""
  );
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        // setIsError(false);

        const response = await fetch("/api/dropdown/get-drop-down-list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            code,
            description,
            merge,
            filters: filters ?? {},
            source,
            type
          }),
        });

        if (!mounted) return;

        const result = await response.json();
        const data = result.data ?? [];
        setOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Dropdown load error:", err);
        if (!mounted) return;
        // setIsError(true);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    if (page || (source === "SOAP" && type)) {
      load();
    }
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, source, type, code, description, JSON.stringify(filters), merge]);

  // Find the selected option object
  const selectedOptionObj =
    options.find((opt) => opt.value === selectedOption) ||
    options.find(
      (opt) => opt.text?.toLowerCase() === selectedOption?.toString()?.toLowerCase()
    );

  // Filter options based on search term
  const filteredOptions =
    searchTerm.trim() === ""
      ? options
      : options.filter((option) =>
          option.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Update local state when value prop changes
  useEffect(() => {
    let incoming = typeof value === "string" ? value : (value?.toString() || "");

    const optionByValue = options.find((opt) => opt.value === incoming);
    const optionByText = options.find(
      (opt) => opt.text?.toLowerCase() === incoming.toLowerCase()
    );

    if (optionByValue) {
      setSelectedOption(optionByValue.value);
    } else if (optionByText) {
      setSelectedOption(optionByText.value);
    } else {
      setSelectedOption(incoming);
    }

    if (multiple) {
      if (Array.isArray(value)) {
        const matchedOptions = options.filter((opt) =>
          value.some(
            (v) => v === opt.value || v?.toLowerCase() === opt.text?.toLowerCase()
          )
        );
        setSelectedOptions(matchedOptions);
      } else if (value) {
        const matchedOption = optionByValue || optionByText;
        setSelectedOptions(matchedOption ? [matchedOption] : []);
      } else {
        setSelectedOptions([]);
      }
    }
  }, [value, options, multiple]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const option = options.find((opt) => opt.value === optionValue);
      if (!option) return;
      let updated;
      if (selectedOptions.some((opt) => opt.value === optionValue)) {
        updated = selectedOptions.filter((opt) => opt.value !== optionValue);
      } else {
        updated = [...selectedOptions, option];
      }
      setSelectedOptions(updated);
      onChange(
        updated.map((opt) => opt.value),
        updated
      );
    } else {
      setSelectedOption(optionValue);
      const opt = options.find((opt) => opt.value === optionValue);
      onChange(optionValue, opt);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleSelectChange = (e) => {
    const newValue = e.target.value;
    if (multiple) {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      const selectedOpts = options.filter((opt) =>
        selected.includes(opt.value)
      );
      setSelectedOptions(selectedOpts);
      onChange(selected, selectedOpts);
    } else {
      setSelectedOption(newValue);
      const opt = options.find((opt) => opt.value === newValue);
      onChange(newValue, opt);
    }
  };

  if (!searchable) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            name={name}
            className={`w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-white appearance-none`}
            value={multiple ? selectedOptions.map((o) => o.value) : selectedOption}
            onChange={handleSelectChange}
            disabled={disabled || isLoading}
            required={required}
            multiple={multiple}
          >
            {!multiple && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <IconChevronDown size={18} className="text-gray-400" />
          </div>
        </div>
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-2 flex items-center justify-between cursor-pointer bg-white transition-all ${disabled ? "bg-gray-100 opacity-60 cursor-not-allowed" : "hover:border-brand-green"} ${isOpen ? "ring-2 ring-brand-green border-brand-green shadow-sm" : ""}`}
      >
        <div className="flex flex-wrap gap-1 items-center overflow-hidden">
          {multiple && selectedOptions.length > 0 ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="bg-brand-green text-white px-2 py-0.5 rounded-md flex items-center text-xs border border-brand-green"
              >
                {opt.text}
                <button
                  type="button"
                  className="ml-1 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionSelect(opt.value);
                  }}
                >
                  <IconX size={12} stroke={3} />
                </button>
              </span>
            ))
          ) : (
            <span className={`truncate ${!selectedOptionObj ? "text-gray-400" : "text-gray-700"}`}>
              {selectedOptionObj ? selectedOptionObj.text : placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <IconLoader2 size={16} className="animate-spin text-brand-green" />}
          <IconChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          <div className="p-2 border-b border-gray-50 flex items-center gap-2">
            <IconSearch size={16} className="text-gray-400 ml-2" />
            <input
              type="text"
              className="w-full px-2 py-1.5 text-sm focus:outline-none border-none placeholder-gray-400"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }} 
                    className="p-1 hover:bg-gray-100 rounded-full"
                >
                    <IconX size={14} className="text-gray-400" />
                </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    multiple && selectedOptions.some((opt) => opt.value === option.value)
                      ? "bg-brand-green-50 text-brand-green font-medium"
                      : !multiple && option.value === selectedOption
                      ? "bg-brand-green-50 text-brand-green font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{option.text}</span>
                  {(multiple && selectedOptions.some((opt) => opt.value === option.value)) || (!multiple && option.value === selectedOption) ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-green shadow-sm"></div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-400 italic">
                {isLoading ? "Fetching data..." : "No matching options found"}
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className="text-xs text-red-500 mt-1 pl-1">{error}</div>}
      
      {!multiple && <input type="hidden" name={name} value={selectedOption} />}
    </div>
  );
};

export default GlobalDropdown;
