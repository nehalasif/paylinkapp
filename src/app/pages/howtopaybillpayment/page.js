'use client';
import React, { useState, useEffect } from 'react';
import data from '../../components/banksData.json';
import Header from '../../components/header';
import logo from '../../components/Images/kuickpay-logo.png';

const BanksPage = () => {
  const [selectedBank, setSelectedBank] = useState(null);

  useEffect(() => {
    if (data.banks.length > 0) {
      setSelectedBank(data.banks[0]); // Set first bank as default
    }
  }, []);

  return (
    <div className="mx-auto p-4">
      <Header Heading={"How to Pay using Bill Payment"} logo={logo} />
      
      <div className="container mx-auto mt-6">
        <div className="flex flex-col md:flex-row gap-6 mt-2">
          {/* Sidebar - Bank List */}
         <div className='w-full md:w-1/3'>
         <h5 className="text-sm md:text-base text-center font-semibold text-gray-800 mb-4 xsize:mb-1">Select Your Bank</h5>
         <div className=" bg-gray-100 p-4 rounded-lg h-[500px] xsize:h-[200px] overflow-y-auto shadow-md">
            
            <ul>
              {data.banks.map((bank, index) => (
                <li 
                  key={index} 
                  onClick={() => setSelectedBank(bank)}
                  className={`p-2 md:p-3 cursor-pointer border-b hover:bg-gray-200 transition-all text-sm md:text-base ${selectedBank?.name === bank.name ? 'bg-gray-300' : ''}`}>
                  {bank.name}
                </li>
              ))}
            </ul>
          </div>
         </div>
         
          
          {/* Content - Bank Details */}
          
            {selectedBank ? (
              <>
              <div className="w-full md:w-2/3">
                <h2 className="text-base md:text-xl font-bold text-center text-gray-800 mb-3">{selectedBank.name}</h2>
                <div className=' bg-white p-4 md:p-6 h-[500px] xsize:h-[400px] overflow-y-auto  rounded-lg shadow-md'>
                {selectedBank.internetBanking && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 text-sm md:text-base">Internet Banking:</h3>
                    <ul className="list-disc list-inside text-gray-600 text-sm md:text-base">
                      {selectedBank.internetBanking.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedBank.mobileBanking && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 text-sm md:text-base">Mobile Banking:</h3>
                    <ul className="list-disc list-inside text-gray-600 text-sm md:text-base">
                      {selectedBank.mobileBanking.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm md:text-base">Select a bank to see details.</p>
            )}
          
        </div>
      </div>
    </div>
  );
};

export default BanksPage;
