'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/header';
import logo from '../components/Images/kuickpay-logo.png';

// Main Component
const BanksPage = () => {
  const searchParams = useSearchParams();
  const [banksData, setBanksData] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [consumerId, setConsumerId] = useState(null);

  // Effect to get consumerId from URL
  useEffect(() => {
    const cid = searchParams.get('cid');
    if (cid) {
      setConsumerId(cid);
    }
  }, [searchParams]);

  // Effect to fetch bank data from JSON file
  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const response = await fetch('/banks.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBanksData(data);
      } catch (error) {
        console.error("Failed to fetch bank instructions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBankData();
  }, []);

  // ==================== ⬇️ MODIFIED SECTION ⬇️ ====================
  // Filter banks based on search term, with special handling for 'otc'
  const filteredBanks = banksData.filter(bank => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    // Condition 1: The bank's name includes the search term (original functionality)
    const nameMatch = bank.name.toLowerCase().includes(lowercasedSearchTerm);
    
    // Condition 2: The user is searching for "otc" and the bank is in the "otc" category
    const otcCategoryMatch = lowercasedSearchTerm === 'otc' && bank.category === 'otc';

    // Return true if either condition is met
    return nameMatch || otcCategoryMatch;
  });
  // ==================== ⬆️ END OF MODIFIED SECTION ⬆️ ====================


  // Grouping the filtered banks into categories
  const digitalBanks = filteredBanks.filter(bank => bank.category === 'digital');
  const otcPartners = filteredBanks.filter(bank => bank.category === 'otc');

  // Effect to manage the selected bank state
  useEffect(() => {
    if (filteredBanks.length > 0) {
      const isSelectedBankInList = filteredBanks.some(b => b.id === selectedBank?.id);
      if (!isSelectedBankInList) {
        setSelectedBank(filteredBanks[0]);
      }
    } else {
      setSelectedBank(null);
    }
  }, [filteredBanks, selectedBank]);


  // Helper to format instruction titles
  const formatTitle = (title) => {
    const trimmedTitle = title.trim();
    if (title.toLowerCase() === 'internet') return 'Internet Banking';
    if (title.toLowerCase() === 'mobile') return 'Mobile Banking';
    return trimmedTitle.charAt(0).toUpperCase() + trimmedTitle.slice(1);
  };
  
  // Helper to inject consumerId into instruction text
  const renderWithConsumerId = (text) => {
    if (!consumerId || !text || !text.includes('{consumerId}')) {
        return text;
    }
    const parts = text.split('{consumerId}');
    return (
        <>
            {parts[0]}
            <strong className="
             bg-gray-200 text-gray-900 px-1.5 py-0.5 rounded-md mx-1">
                {consumerId}
            </strong>
            {parts[1]}
        </>
    );
  };

  // Helper to render a single instruction step, handling login links
  const renderInstructionStep = (step, bank) => {
    const loginPattern = /\(click here to login( now)?\)/i;
    const loginMatch = step.match(loginPattern);

    if (loginMatch && bank.loginUrl) {
      const parts = step.split(loginMatch[0]);
      return (
        <>
          {renderWithConsumerId(parts[0])}
          <a
            href={bank.loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {loginMatch[0]}
          </a>
          {renderWithConsumerId(parts[1])}
        </>
      );
    }
    return renderWithConsumerId(step);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header 
        Heading={"Kuickpay - How to Pay"}
        logo={logo}
      />

      {/* Top Section: Intro Text (This remains centered) */}
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
            <div className="text-center my-4">
                <p className="text-md text-slate-600">
                Select your bank or payment partner to see detailed instructions.
                </p>
              
              
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-lg text-slate-500">Loading payment instructions...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 mt-2 px-4 sm:px-6 lg:px-8 ">
          
          <div className='w-full md:w-1/4'>
  <h2 className="text-base md:text-xl  text-center text-gray-800 ">
              Select Your Bank or Partner
            </h2>
            <div className="bg-gray-100 rounded-lg h-[250px] md:h-[500px] overflow-y-auto shadow-md">
                <div className="p-4">
                    <input
                    type="text"
                    placeholder="Search for a bank or 'otc'..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                </div>
                {filteredBanks.length > 0 ? (
                    <ul>
                        {digitalBanks.length > 0 && digitalBanks.map((bank) => (
                            <li 
                                key={bank.id} 
                                onClick={() => setSelectedBank(bank)}
                                className={`p-2 md:p-3 px-4 cursor-pointer border-b hover:bg-gray-200 transition-all text-sm md:text-base ${selectedBank?.id === bank.id ? 'bg-gray-300 tracking-widest' : ''}`}
                            >
                                {bank.name}
                            </li>
                        ))}
                        {otcPartners.length > 0 && (
                            <>
                                <li className="p-3 text-center drop-shadow-lg    font-bold text-slate-600 border sticky top-0">
                                    Over the Counter (OTC)
                                </li>
                                {otcPartners.map(partner => (
                                    <li 
                                        key={partner.id} 
                                        onClick={() => setSelectedBank(partner)}
                                        className={`p-2 md:p-3 px-4 cursor-pointer border-b hover:bg-gray-200 transition-all text-sm md:text-base ${selectedBank?.id === partner.id ? 'bg-gray-300 text-4xl font-semibold' : ''}`}
                                    >
                                        {partner.name}
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-4/5">
                       <p className="text-gray-500 text-center px-4">No banks found matching your search.</p>
                    </div>
                )}
            </div>
          </div>
     
          <div className="w-full md:w-3/4">
            {selectedBank ? (
              <>
  <h2 className="text-base md:text-xl font-bold text-center text-gray-800 ">
                        {selectedBank.name}</h2>
                <div className='bg-white p-4 md:p-6 h-[400px] md:h-[500px] overflow-y-auto rounded-lg shadow-md'>
                    {selectedBank.instructions && Object.keys(selectedBank.instructions).length > 0 ? (
                        <div className="space-y-8">
                            {Object.keys(selectedBank.instructions).map((instructionType) => (
                                <div key={instructionType}>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                                    {formatTitle(instructionType)}
                                </h3>
                                <ol className="space-y-3">
                                    {selectedBank.instructions[instructionType].map((step, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-50 text-blue-600 font-bold rounded-full text-xs">
                                        {index + 1}
                                        </span>
                                        <span className="text-slate-600 text-sm pt-0.5">
                                        {renderInstructionStep(step, selectedBank)}
                                        </span>
                                    </li>
                                    ))}
                                </ol>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 flex items-center justify-center h-full">
                            <p className="text-slate-500 font-medium">
                                Instructions for {selectedBank.name} are coming soon...
                            </p>
                        </div>
                    )}
                </div>
              </>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-white p-6 rounded-lg shadow-md min-h-[400px] md:min-h-[500px]">
                    <p className="text-gray-500 text-sm md:text-base text-center">
                        {searchTerm ? "No partner found." : "Select a bank or partner to see instructions."}
                    </p>
                </div>
                      )}   
          </div>
        </div>
      )}
    </div>
  );
};

const BanksPageWithSuspense = () => (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading Page... </div>}>
      <BanksPage />
    </Suspense>
);
 
export default BanksPageWithSuspense;