'use client';

import React from 'react';

const Footer = ({ Heading }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative w-full">
      {/* 
        CHANGES MADE:
        1. Removed 'md:h-40' and 'xsize:h-20' (Fixed height hata di).
        2. Added 'py-4' (Top/Bottom padding) taake text bilkul chipka na ho, lekin extra space bhi na ho.
        3. 'items-center' kar diya taake text vertically center rahy (agar height auto hai).
      */}
      <footer className="w-full flex items-center justify-between px-4 py-2 md:px-8 z-0">
        
        {/* Left Side Text */}
        <p className="font-thin text-slate-400 md:text-sm sm:text-sm xsize:text-[8px]">
          © {currentYear}, ALL RIGHTS RESERVED BY
        </p>
        
        {/* Right Side Text */}
        <p className="font-thin text-[#4A9AE8] md:text-sm sm:text-sm xsize:text-[8px]">
          INNOVARGE TECHNOLOGIES (Pvt.) Ltd
        </p>

      </footer>
    </div>
  );
};

export default Footer;