'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../components/header';
import logo from '../components/Images/kuickpay-logo.png';

// Main Component
const BanksPage = () => {
  const searchParams = useSearchParams();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [banksData, setBanksData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [consumerId, setConsumerId] = useState(null);

  useEffect(() => {
    const cid = searchParams.get('cid');
    if (cid) {
      setConsumerId(cid);
    }
  }, [searchParams]);

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

  const toggleAccordion = (bankId) => {
    setActiveAccordion((prev) => (prev === bankId ? null : bankId));
  };

  const filteredBanks = banksData.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouping the filtered banks into categories
  const digitalBanks = filteredBanks.filter(bank => bank.category === 'digital');
  const otcPartners = filteredBanks.filter(bank => bank.category === 'otc');

  const formatTitle = (title) => {
    const trimmedTitle = title.trim();
    if (title.toLowerCase() === 'internet') return 'Internet Banking';
    if (title.toLowerCase() === 'mobile') return 'Mobile Banking';
    return trimmedTitle.charAt(0).toUpperCase() + trimmedTitle.slice(1);
  };
  
  const renderWithConsumerId = (text) => {
    if (!consumerId || !text || !text.includes('{consumerId}')) {
        return text;
    }
    const parts = text.split('{consumerId}');
    return (
        <>
            {parts[0]}
            <strong className="font-mono bg-gray-200 text-gray-900 px-1.5 py-0.5 rounded-md mx-1">
                {consumerId}
            </strong>
            {parts[1]}
        </>
    );
  };

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
            className="text-blue-600 hover:underline font-semibold"
          >
            {loginMatch[0]}
          </a>
          {renderWithConsumerId(parts[1])}
        </>
      );
    }
    return renderWithConsumerId(step);
  };

  // Helper function to render a single accordion item to avoid repetition
  const renderBankAccordion = (bank) => (
    <div key={bank.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
      <button
        onClick={() => toggleAccordion(bank.id)}
        className={`w-full flex justify-between items-center p-4 text-left text-lg transition-colors duration-200 ${
          activeAccordion === bank.id
            ? 'bg-gray-100 text-gray-900 font-semibold'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>{bank.name}</span>
        <span className={`transform transition-transform duration-300 ${activeAccordion === bank.id ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {activeAccordion === bank.id && (
        <div className="p-6 bg-white border-t border-slate-200">
          {bank.instructions && Object.keys(bank.instructions).length > 0 ? (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {Object.keys(bank.instructions).map((instructionType) => (
                <div key={instructionType}>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
                    {formatTitle(instructionType)}
                  </h3>
                  <ol className="space-y-3">
                    {bank.instructions[instructionType].map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-50 text-blue-600 font-bold rounded-full text-xs">
                          {index + 1}
                        </span>
                        <span className="text-slate-600 text-sm pt-0.5">
                          {renderInstructionStep(step, bank)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-slate-500 font-medium">
                Instructions for {bank.name} are coming soon...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header 
        Heading={"Kuickpay - How to Pay"}
        logo={logo}
      />

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 ">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-6">
            <p className="text-md text-slate-600">
              Select your bank or payment partner to see detailed instructions.
            </p>
            {consumerId && (
                <p className="text-md text-slate-500 mt-4">
                    Your Consumer ID is: <br />
                    <strong className='bg-gray-100 text-gray-800 px-3 py-1 mt-1 inline-block rounded-md text-lg font-mono'>
                        {consumerId}
                    </strong>
                </p>
            )}
            <p className="text-gray-700 mt-2">
              Have Questions? Contact us on{' '}
              <a href="https://wa.me/923358425729" target="_blank" rel="noopener noreferrer" className="text-green-500 font-bold hover:underline">
                WhatsApp (0335-8425729)
              </a>
            </p>
          </div>

          <div className="mb-8 flex justify-center">
            <input
              type="text"
              placeholder="Search for a bank or partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-lg p-3 border border-gray-300 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-lg text-slate-500">Loading payment instructions...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBanks.length === 0 && (
                <div className="text-center py-5 text-slate-500 bg-white rounded-lg border p-6">
                  <p>No banks or partners found matching your search.</p>
                </div>
              )}

              {/* Render Digital Banks */}
              {digitalBanks.map(bank => renderBankAccordion(bank))}

              {/* Conditionally render OTC Heading and Partners */}
              {otcPartners.length > 0 && (
                <>
                  <div className="pt-8 pb-2 text-center">
                    <h2 className="text-2xl  text-slate-700   pb-3">
                      Over the Counter (OTC) Partners (Select the partner to see its process)
                    </h2>
                  </div>
                  {otcPartners.map(partner => renderBankAccordion(partner))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper component to handle Suspense for useSearchParams
const BanksPageWithSuspense = () => (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading Page...</div>}>
      <BanksPage />
    </Suspense>
);
  
export default BanksPageWithSuspense;