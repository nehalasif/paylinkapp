'use client';

import React from 'react';
import Image from 'next/image';

const Textbox = ({ Icon, placeholder, value, onChange, ref }) => {
  return (
    <div className="">
      {/* 
          CHANGES:
          1. 'border' class hata di hai.
          2. 'mb-6' hata diya hai (spacing parent component se control honi chahiye).
          3. Padding 'px-2 py-3' kar di hai taake textbox thora khula aur saaf nazar aye.
      */}
      <div className="flex items-center w-full px-2 py-3 rounded-lg bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400 transition-all">
        
        {Icon && <Image src={Icon} alt="Icon" className="w-6 h-6 ml-1 " />}
        
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          // bg-transparent zaroori hai taake peeche ka gray color nazar aye
          className="px-3 w-full h-full focus:outline-none bg-transparent text-slate-700 placeholder-slate-500"
          value={value} 
          onChange={onChange} 
        />
      </div>
    </div>
  );
};

export default Textbox;