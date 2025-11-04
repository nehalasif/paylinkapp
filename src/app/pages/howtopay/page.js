'use client';
import React, { useState } from 'react';
import Head from 'next/head';

const BanksPage = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (bankName) => {
    setActiveAccordion((prev) => (prev === bankName ? null : bankName));
  };

  return (
    <>
      <Head>
        <title>Bank Payment Instructions</title>
      </Head>

      <div className="container mx-auto px-4 my-10">
        <h2 className="text-3xl font-semibold text-center mb-6">Bank Payment Instructions</h2>

        {/* Allied Bank */}
        <div className="border-b border-gray-300 mb-4">
          <button
            onClick={() => toggleAccordion('ABL')}
            className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 font-medium text-lg"
          >
            Allied Bank
          </button>
          {activeAccordion === 'ABL' && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="mb-4">
                <strong>Internet Banking:</strong>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>
                    Login to your Internet Banking (
                    <a
                      href="https://login.abl.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      click here to login now
                    </a>
                    )
                  </li>
                  <li>Select Pay Bills</li>
                  <li>
                    Select KuickPay as Category and then Select relevant biller name. If the biller
                    is not showing, select <strong>Others</strong>.
                  </li>
                  <li>Enter Consumer ID and click Validate</li>
                  <li>Confirm details and Pay</li>
                </ol>
              </div>

              <div>
                <strong>Mobile Banking:</strong>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Login to myABL Mobile App</li>
                  <li>Select Pay Bills</li>
                  <li>
                    Select KuickPay as Category and then Select relevant biller name. If the biller
                    is not showing, select <strong>Others</strong>.
                  </li>
                  <li>Enter Consumer ID and click Validate</li>
                  <li>Confirm details and Pay</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Add more banks here using the same structure */}
        <div className="border-b border-gray-300 mb-4">
          <button
            onClick={() => toggleAccordion('MCB')}
            className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 font-medium text-lg"
          >
            MCB Bank
          </button>
          {activeAccordion === 'MCB' && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p>
                <strong>Instructions for MCB coming soon...</strong>
              </p>
            </div>
          )}
        </div>

        {/* Repeat the structure for more banks */}
      </div>
    </>
  );
};

export default BanksPage;
