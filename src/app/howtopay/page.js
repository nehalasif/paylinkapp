'use client';
import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/header';
import logo from '../components/Images/kuickpay-logo.png';

const BanksPage = () => {
  // const [activeAccordion, setActiveAccordion] = useState(null);

  // const toggleAccordion = (bankName) => {
  //   setActiveAccordion((prev) => (prev === bankName ? null : bankName));
  // };
const [openPanel, setOpenPanel] = useState(null);

  const togglePanel = (panel) => {
    setOpenPanel(openPanel === panel ? null : panel);
  };
  return (
    <div className="mx-auto p-4">
       <Header 
               Heading={"Kuickpay - How to Pay using Bill Payment"}
                logo={logo}
                
              />
    

      <div className="container mx-auto mt-20">
        <div className="row">
          <div className="col-md-12">
            <div className="text-center">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4">
                Kuickpay - How to Pay using Bill Payment (Internet/Mobile Banking and ATM)
              </h4>
              <h5 className="text-gray-700">
                Have Questions? Contact us on{' '}
                <a href="https://wa.me/923358425729" target="_blank" className="text-green-500 font-bold hover:underline">
                  WhatsApp (+92-335-8425729)
                </a>
              </h5>
            </div>
            

            <div className="flex gap-[20px]">
            {/*lines of code placeholder */}



  <div className="grow w-[40%] bg-red-200">

    DIV 1
  </div>

  <div className="grow w-[70%] bg-red-400">

    DIV 2
    </div>
</div>


          

            <div className="mt-8">
              <h5 className="text-lg font-semibold text-gray-800 mb-4">
                Digital Partner Banks (Select the bank to see its process)
              </h5>
              <div className="space-y-4">
                {[
                  { id: 'ABL', title: 'Allied Bank', content: 'Internet Banking and Mobile Banking instructions...' },
                  { id: 'BAB', title: 'Al Baraka Bank', content: 'Internet Banking and Mobile Banking instructions...' },
                  // Add more banks here
                ].map((bank) => (
                  <div key={bank.id} className="border border-gray-300 rounded">
                    <div
                      className="p-4 bg-gray-100 cursor-pointer"
                      onClick={() => togglePanel(bank.id)}
                    >
                      <h4 className="text-lg font-semibold">{bank.title}</h4>
                    </div>
                    {openPanel === bank.id && (
                      <div className="p-4 bg-white">
                        <p>{bank.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h5 className="text-lg font-semibold text-gray-800 mb-4">
                Over the Counter (OTC) Partners (Select the partner to see its process)
              </h5>
              <div className="space-y-4">
                {[
                  { id: 'TCSOTC', title: 'TCS', content: 'TCS Express Centers instructions...' },
                  { id: 'MBLOTC', title: 'Meezan Bank', content: 'Meezan Bank Branches instructions...' },
                  // Add more OTC partners here
                ].map((partner) => (
                  <div key={partner.id} className="border border-gray-300 rounded">
                    <div
                      className="p-4 bg-gray-100 cursor-pointer"
                      onClick={() => togglePanel(partner.id)}
                    >
                      <h4 className="text-lg font-semibold">{partner.title}</h4>
                    </div>
                    {openPanel === partner.id && (
                      <div className="p-4 bg-white">
                        <p>{partner.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BanksPage;
