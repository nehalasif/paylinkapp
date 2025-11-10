import React from 'react';
import Image from 'next/image';

const SearchableTextbox = ({ 
  placeholder, 
  options, 
  searchText, 
  setSearchText, 
  isOpen, 
  setIsOpen, 
  onSelect,
  Icon,  // यह prop बाहर से आएगा
  isLoading,
  disabled,
  ...props 
}) => {
  
  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelectOption = (option) => {
    onSelect(option);
    setSearchText(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      
      {/* यह हिस्सा तभी रेंडर होगा जब 'Icon' prop पास किया जाएगा */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
        {Icon && <Image src={Icon} alt="Icon" className="w-6 h-6" />}
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={searchText}
        onChange={handleInputChange}
        onFocus={() => !disabled && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        disabled={disabled}
        // pl-12 (padding-left) जरूरी है ताकि टेक्स्ट आइकन के ऊपर न आए
        className="w-full p-2 pl-12 pr-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#287dce] disabled:bg-gray-100 disabled:cursor-not-allowed"
        {...props}
      />

      {/* लोडिंग स्पिनर */}
      {isLoading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#287dce] rounded-full animate-spin"></div>
        </div>
      )}

      {/* ड्रॉपडाउन */}
      {isOpen && options.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSelectOption(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableTextbox;