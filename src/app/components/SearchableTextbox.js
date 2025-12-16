'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import SearchIcon from '../components/svgs/cardinfo/search.svg';

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

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  // useEffect(() => {
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  const handleItemClick = (option) => {
    setSearchText(option);  // Update searchText with selected option
    onSelect(option);        // Notify parent component
    setIsOpen(false);        // Close the dropdown after selection
  };

  return (
    <div className="relative">
      {/* Search input */}
      <div
        className="flex items-center w-full px-2 py-2 border rounded-lg bg-white"
        onClick={() => setIsOpen(true)} // Open dropdown when clicked
      >
        <Image src={SearchIcon} alt="Search Icon" className="w-6 h-6" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)} // Update search text
          placeholder={placeholder}
          className="px-5 w-full h-max focus:outline-none"
        />
      </div>

      {/* Dropdown with filtered options */}
      {isOpen && ( //&& searchText 
        <ul
          ref={dropdownRef}
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-auto"
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                onClick={() => handleItemClick(option)} // Handle item selection
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableTextbox;
