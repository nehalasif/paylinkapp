'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import SearchIcon from './svgs/cardinfo/search.svg'; // Path check kar lijiyega

const SearchableTextbox = ({
  placeholder,
  options,
  searchText,
  setSearchText,
  isOpen,
  setIsOpen,
  onSelect,
}) => {
  const dropdownRef = useRef(null);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (option) => {
    setSearchText(option);
    onSelect(option);
    setIsOpen(false); // Standard UX: Select karne ke baad list band honi chahiye
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Search Input Container */}
      {/* Yahan bg-gray-100 hai */}
      <div
        className="flex items-center w-full px-2 py-2 border border-gray-100 rounded-lg bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <Image src={SearchIcon} alt="Search Icon" className="w-6 h-6 ml-1 " />
        
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={'Search Your Biller'}
          // IMPORTANT: 'bg-transparent' add kiya hai taake peeche ka gray color nazar aye
          className="px-3 w-full h-full focus:outline-none bg-transparent text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <ul
          className="absolute z-20 w-full mt-1 bg-gray-100 border border-gray-200 rounded-lg shadow-xl max-h-44 overflow-y-auto"
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors"
                onClick={() => handleItemClick(option)}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 text-sm italic">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableTextbox;