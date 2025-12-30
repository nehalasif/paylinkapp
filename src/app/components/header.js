'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import whatsapp from '../components/Images/whatsappIcon.png';

const Header = ({ Heading, logo, classType, width, height, logoLoader }) => {
    return (
        <div className="bg-gradient-to-b from-customBlue to-customPurple">

            {/* Navbar / Logo Section */}
            <nav className="flex justify-between items-center mg:p-2 xsize:p-1">
                {/* Logo Section */}
                <div className="flex items-center lg:ml-5 sm:ml-5 xsize:ml-5 ">
                    {logoLoader ? (
                        <div className="content flex items-center">
                            <div className="w-28 h-12 bg-customPulseColor rounded"></div>
                        </div>
                    ) : (
                        <Link href="/">
                            <Image
                                src={logo}
                                alt="Logo"
                                className="object-contain w-[150px] h-auto cursor-pointer"
                                height={0}
                                width={150}
                                sizes="(max-width: 640px) 100px, (max-width: 1024px) 120px, 150px"
                                unoptimized={false}
                            />
                        </Link>
                    )}
                </div>

                {/* WhatsApp Section */}
                <div className="flex items-center text-green-600 rounded-md px-2 m-4 sm:ml-1 md:ml-5">
                    <p className="flex items-center space-x-2">
                        <Image
                            src={whatsapp}
                            alt="GIF Icon"
                            className="w-10 h-10 sm:w-8 sm:h-8 xsize:w-5 xsize:h-5"
                        />
                        <span className="text-sm sm:text-xs md:text-base">0335-8425729</span>
                    </p>
                </div>
            </nav>

            {/* Payment Link Section - Single Line Style */}
           
                
                                               <div className="border-t mt-2"></div>

        </div>
    );
};

export default Header;