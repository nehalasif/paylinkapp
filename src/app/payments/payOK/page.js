'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createAxiosInstance } from '@/app/constants/axiosInstance';
import { API_URLS } from '@/app/constants/config';
import EncryptionUtils from "../../utils/encryptionUtils";
import Header from '@/app/components/header'; // Header Import
import logo from '../../components/Images/kuickpay-logo.png'; // Logo Import
import Footer from '@/app/components/footer'; // Footer Import
import html2canvas from 'html2canvas';

// --- Exact Green Check Icon from Screenshot ---
const SuccessIcon = () => (
  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#dcfce7] mb-4">
    <svg className="h-8 w-8 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
);

const PayOK = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processedData, setProcessedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const hiddenRef = useRef();
  
  const currentDate = new Date();
  // Formatting Date exactly like screenshot: "24 Dec 2025, 16:05"
  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit', hour12: false };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  };

  const handleDownload = async () => {
    if (hiddenRef.current) {
      try {
        const canvas = await html2canvas(hiddenRef.current, {
          scale: 2, 
          useCORS: true,
          backgroundColor: '#ffffff', 
          logging: false,
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `Receipt-${data?.kuickpayID || 'Transaction'}.png`;
        link.click();
      } catch (error) {
        console.error('Error capturing element:', error);
      }
    }
  };

  const transactionPost = async () => {
    let instID = '';
    const dataBusRaw = sessionStorage.getItem('dataBus');
    if (dataBusRaw) {
        try {
            const decryptedJson = EncryptionUtils.decryptText(dataBusRaw);
            const parsedData = JSON.parse(decryptedJson);
            instID = parsedData?.Institution?.institutionID || '';
        } catch (e) {
            console.error("Error parsing DataBus for ID", e);
        }
    }

    const payload = {
      institutionID: instID, 
      transactionID: sessionStorage.getItem('transactionID') || '',
      orderID: sessionStorage.getItem('orderID') || '',
      amount: sessionStorage.getItem('amount') || '0',
      SecurityCode: '', 
      CardNumber: '',   
      ExpiryMonth: '',
      ExpiryYear: '',
      cnic: '',
      type: "Card",
      UserID: 'Guest',
      isEncrypt: false,
    };

    const token = sessionStorage.getItem('token');
    
    if (!token) {
        setIsLoading(false);
        return;
    }

    const checkoutAxios = createAxiosInstance({
      baseURL: API_URLS.gatewayUrl,
      token: token,
    });

    try {
      const res = await checkoutAxios.post('/api/Transaction', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.status === 200) {
        setProcessedData(res.data);
      }
    } catch (ex) {
      console.error("❌ Transaction API Error:", ex);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsLoading(true);

        const dataBusRaw = sessionStorage.getItem('dataBus');
        if (dataBusRaw) {
          const decryptedJson = EncryptionUtils.decryptText(dataBusRaw);
          const parsedData = JSON.parse(decryptedJson);
          
          setData({
            voucherData: parsedData.voucherData,
            institution: parsedData.Institution,
            kuickpayID: parsedData.kuickpayID,
          });
        }
        await transactionPost();
      } catch (error) {
        console.error('❌ Error in useEffect:', error);
        setIsLoading(false); 
      }
    };

    initializePage();
  }, []);

  const backtoHome = async () => {
    router.push('/');
  };

  return (
    // Outer Container with Flex Column and light background
    <div className="flex flex-col min-h-screen font-sans bg-[#f9fafb]">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 w-full pt-2">
         <Header Heading="" logo={logo} width={140} height={40} />
      </div>

      {/* --- MAIN CONTENT (Centered Card) --- */}
      <main className="flex-grow flex items-center justify-center p-4">
        
        {/* === MAIN WHITE CARD === */}
        <div className="bg-white w-full max-w-[420px] rounded-[30px] shadow-2xl shadow-indigo-100/50 p-8 pb-10 border border-gray-100">
          
          {/* Capture Area starts here */}
          <div ref={hiddenRef} className="bg-white rounded-t-[30px]"> 
              
              {/* Success Header */}
              <div className="text-center mb-8">
                  <SuccessIcon />
                  <h1 className="text-xl font-bold text-gray-900 mb-1">Payment Successful</h1>
                  <p className="text-gray-400 text-xs">Thank you! Your transaction is completed.</p>
              </div>

              {/* Amount Section */}
              {!isLoading && data ? (
                  <>
                  <div className="text-center mb-10">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">TOTAL AMOUNT PAID</p>
                      <div className="flex justify-center items-baseline text-gray-800">
                          <span className="text-lg font-bold text-gray-500 mr-1.5">PKR</span>
                          {/* Changed from toFixed(1) to toFixed(2) */}
                          <span className="text-4xl font-extrabold tracking-tight">
                              {Number(data.voucherData?.billAmount).toFixed(2)}
                          </span>
                      </div>
                  </div>

                  {/* Details List with Dotted Lines */}
                  <div className="space-y-4 mb-8">
                      
                      {/* Paid to */}
                      <div className="flex justify-between items-center text-xs pb-3 border-b border-dashed border-gray-100">
                          <span className="text-gray-400 font-medium">Paid to</span>
                          <span className="text-gray-800 font-bold text-right truncate max-w-[180px]">
                              {data.institution?.institutionName}
                          </span>
                      </div>

                      {/* Consumer ID (Grey Pill Style) */}
                      <div className="flex justify-between items-center text-xs pb-3 border-b border-dashed border-gray-100">
                          <span className="text-gray-400 font-medium">Consumer ID</span>
                          <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-md tracking-wide">
                              {data.kuickpayID}
                          </span>
                      </div>

                      {/* Customer Name */}
                      <div className="flex justify-between items-center text-xs pb-3 border-b border-dashed border-gray-100">
                          <span className="text-gray-400 font-medium">Customer Name</span>
                          <span className="text-gray-800 font-bold text-right truncate max-w-[180px]">
                              {data.voucherData?.consumer_Detail || 'Guest User'}
                          </span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex justify-between items-center text-xs pb-1">
                          <span className="text-gray-400 font-medium">Date & Time</span>
                          <span className="text-gray-800 font-bold">
                              {formatDate(currentDate)}
                          </span>
                      </div>
                  </div>
                  </>
              ) : (
                  // Skeleton Loader
                  <div className="animate-pulse space-y-6 mb-8">
                      <div className="h-16 w-3/4 bg-gray-100 rounded mx-auto"></div>
                      <div className="space-y-4">
                          <div className="h-4 bg-gray-50 rounded w-full"></div>
                          <div className="h-4 bg-gray-50 rounded w-full"></div>
                          <div className="h-4 bg-gray-50 rounded w-full"></div>
                      </div>
                  </div>
              )}
          </div> 
          {/* End of Capture Area */}

          {/* Buttons */}
          {!isLoading && data && (
              <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDownload} 
                    className="w-full py-3 rounded-xl bg-[#1d72b8] text-white font-semibold text-sm shadow-md hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Save Receipt
                  </button>

                  <button 
                    onClick={backtoHome} 
                    className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Close & Return Home
                  </button>
              </div>
          )}

          {/* App Link */}
          <div className="mt-6 text-center">
              <a href="#" className="text-[10px] text-blue-400 hover:underline">
                  Download Kuickpay App for easier payments
              </a>
          </div>

        </div>

      </main>

      {/* --- FOOTER --- */}
      <div className="shrink-0 w-full">
          <Footer />
      </div>

    </div>
  );
};

const PaymentInitilizationWithSuspense = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6]">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    }>
      <PayOK />
    </Suspense>
  );
};

export default PaymentInitilizationWithSuspense;