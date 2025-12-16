'use client';

import React from 'react';
// import Image from 'next/image';
// import footerSVG from '../components/svgs/Footer.svg';

const Footer = ({ Heading }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative pt-24">
      {/* 
        FOOTER ELEMENT MEIN TABDEELI:
        1. 'justify-center' ko 'justify-between' se badla gaya hai taake items kinaron par chalen jayen.
        2. 'px-4' (padding left/right) aur 'pb-2' (padding bottom) add ki gayi hai taake text bilkul kinaron se na chipke.
        3. 'items-end' ko rakha gaya hai taake text neeche align ho.
      */}
      <footer className="bottom-0 left-0 w-full flex items-end justify-between px-4 pb-2 md:px-8 md:h-40 xsize:h-20 z-[-1]">
        
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