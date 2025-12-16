'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import whatsapp from '../components/Images/whatsappIcon.png';





const Header = ({Heading,logo,classType,width,height,logoLoader}) => {
    return (
        <div className="bg-gradient-to-b from-customBlue to-customPurple">

{/* <div className="bg-gradient-to-b from-customBlue to-customPurple h-64 w-full flex items-center justify-center">
  <h1 className="text-grey text-2xl font-bold">Custom Gradient</h1>
</div> */}

            {/* Logo Section */}
           
            <nav className="flex justify-between items-center mg:p-2 xsize:p-1">
  {/* Logo Section */}
  <div className="flex items-center lg:ml-5 sm:ml-5 xsize:ml-5 ">
    {logoLoader ? (
      <div className="content flex items-center">
        <div className="w-28 h-12 bg-customPulseColor rounded"></div>
      </div>
    ) : (
      <Image
        src={logo}
        alt="Logo"
        className="object-contain w-[150px] h-auto" // Ensure the logo maintains aspect ratio
        // Default size for larger screens
        height={0}
        width={150}
        sizes="(max-width: 640px) 100px, (max-width: 1024px) 120px, 150px" // Adjust logo size based on screen width
        unoptimized={false}
      />
    )}
  </div>

  {/* WhatsApp Section */}
  <div className="flex items-center text-green-600 rounded-md px-2 m-4 sm:ml-1 md:ml-5">
    <p className="flex items-center space-x-2">
      <Image
        src={whatsapp}
        alt="GIF Icon"
        className="w-10 h-10 sm:w-8 sm:h-8 xsize:w-5 xsize:h-5" // Responsive sizes
      />
      <span className="text-sm sm:text-xs md:text-base">0335-8425729</span>
    </p>
  </div>
</nav>



            {/* Payment Link Section */}
            <div style={{ backgroundColor: '#E3EBF2' }}
                className="rounded-md p-3 ml-5 mr-5 sm:p-2 sm:py-2 sm:ml-5 sm:mr-5 md:p-4 md:py-2 py- lg:py-2  flex justify-center items-center">
                <h2 className="font-outfit text-base md:text-2xl lg:text-4xl text-center">
                    <div>
                        <p className="heading tracking-widest">{Heading}</p>
                    </div>
                </h2>
            </div>
        </div>
    );
};

export default Header;
