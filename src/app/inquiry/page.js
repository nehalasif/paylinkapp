'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQRCode } from 'next-qrcode';
import { createAxiosInstance } from '@/app/constants/axiosInstance';  
import Image from 'next/image';
import CreditCardIcon from '../components/svgs/CreditCard.svg';
import IntMobBankingIcon from '../components/svgs/intMbanking.svg';
import QRCodeIcon from '../components/svgs/QR.svg';
import copyicon from '../components/svgs/copy.svg';
import Header from '../components/header';
import Footer from '../components/footer';
import PoweredByPFRaast from '../components/svgs/poweredby.svg';
import logo from '../components/Images/kuickpay-logo.png';
import logosvg from '../components/svgs/kuickpay.svg';

import { API_URLS } from '../constants/config';
import html2canvas from 'html2canvas';
import EncryptionUtils from "../utils/encryptionUtils";

// --- 1. BANK INSTRUCTIONS ACCORDION COMPONENT (Unchanged) ---
const BankInstructionsAccordion = ({ consumerId }) => {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [banksData, setBanksData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
  
  const digitalBanks = filteredBanks.filter(bank => bank.category === 'digital');
  const otcPartners = filteredBanks.filter(bank => bank.category === 'otc');

  const renderConsumerIdInText = (text) => {
    if (!text || !consumerId || !text.includes('{consumerId}')) return text;
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
          {renderConsumerIdInText(parts[0])}
          <a href={bank.loginUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ">
            {loginMatch[0]}
          </a>
          {renderConsumerIdInText(parts[1])}
        </>
      );
    }
    return renderConsumerIdInText(step);
  };
  
  const formatTitle = (title) => {
    const trimmedTitle = title.trim();
    if (title.toLowerCase() === 'internet') return 'Internet Banking';
    if (title.toLowerCase() === 'mobile') return 'Mobile Banking';
    return trimmedTitle.charAt(0).toUpperCase() + trimmedTitle.slice(1);
  };

  const renderBankAccordionItem = (bank) => (
    <div key={bank.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300">
        <button
          onClick={() => toggleAccordion(bank.id)}
          className={`w-full flex justify-between items-center p-4 text-left text-lg transition-colors duration-200 ${
            activeAccordion === bank.id
              ? 'bg-gray-100 text-gray-800 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
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
          <div className="p-5 bg-white border-t border-slate-200">
            {bank.instructions && Object.keys(bank.instructions).length > 0 ? (
              <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {Object.keys(bank.instructions).map((instructionType) => (
                  <div key={instructionType}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                      {formatTitle(instructionType)}
                    </h3>
                    <ol className="space-y-3">
                      {bank.instructions[instructionType].map((step, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-600 font-bold rounded-full text-xs">
                            {index + 1}
                          </span>
                          <span className="text-slate-600 text-sm">{renderInstructionStep(step, bank)}</span>
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

  if (isLoading) {
    return <div className="text-center py-10"><p className="text-lg text-slate-500">Loading payment instructions...</p></div>;
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Bank Payment Instructions</h1>
        <p className="text-md text-slate-500">Your Consumer ID is: <br /><strong className='bg-gray-100 text-gray-800 px-3 py-1 mt-1 inline-block rounded-md text-lg font-mono'>{consumerId || 'N/A'}</strong></p>
      </div>
      <div className="mb-6">
        <input type="text" placeholder="Search for a bank or partner..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-80 p-2 justify-between border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>
      <div className="space-y-3">
        {filteredBanks.length === 0 && <div className="text-center py-5 text-slate-500"><p>No banks found matching your search.</p></div>}
        {digitalBanks.map(bank => renderBankAccordionItem(bank))}
        {otcPartners.length > 0 && (
          <>
            <div className="pt-8 pb-2 text-center"><h2 className="text-2xl font-semibold text-slate-700 border-b-2 border-slate-300 pb-3">Over the Counter (OTC)</h2></div>
            {otcPartners.map(partner => renderBankAccordionItem(partner))}
          </>
        )}
      </div>
    </div>
  );
};


// --- 2. MODAL WRAPPER COMPONENT (Unchanged) ---
const HowToPayModal = ({ isOpen, onClose, consumerId }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-3 border-b bg-white rounded-t-lg sticky top-0">
                    <h2 className="text-xl text-gray-800">How to Pay</h2>
                </div>
                <div className="p-6 overflow-y-auto"><BankInstructionsAccordion consumerId={consumerId} /></div>
                <div className="p-4 border-t bg-white rounded-b-lg flex justify-end sticky bottom-0">
                    <button onClick={onClose} className="bg-btnBlue text-white px-5 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Close</button>
                </div>
            </div>
        </div>
    );
};


// --- 3. MAIN PAYMENT COMPONENT (UPDATED) ---
const PaymentInitilization = () => {
    const [expanded, setExpanded] = useState(null); 
    const [data, setData] = useState(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [voucherData, setVoucherData] = useState(null);
    const [institutionData, setInstitutionData] = useState(null);
    const [isQrLoading,setIsQrLoading] = useState(true);
    const [inquiryStatus, setInquiryStatus] = useState(false);
    const [whiteLabledLogo, setwhiteLabledLogo] = useState(null);
    const [logoLoader, setLogoLoader] = useState(true);
    const [qRString ,setQRString] = useState("Waiting for Data");
    const hiddenRef = useRef();
    const { Canvas } = useQRCode();
    const [isHowToPayModalOpen, setIsHowToPayModalOpen] = useState(false);
    
    // LOADER KE LIYE NAYA STATE
    const [isDownloading, setIsDownloading] = useState(false);
  
    const handleToggle = (index) => setExpanded(expanded === index ? null : index);

    const handleDownload = async () => {
      if (hiddenRef.current) {
        try {
          const canvas = await html2canvas(hiddenRef.current, { scale: 10, useCORS: true });
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'RaastBillPaymentQR.png';
          link.click();
        } catch (error) { console.error('Error capturing element:', error); }
      }
    };
  
    useEffect(() => {
        const consumerDataEnc = searchParams.get('data');
        if (consumerDataEnc) {
            try {
                const consumerDataEncDec = JSON.parse(EncryptionUtils.decryptText(consumerDataEnc));
                setData(consumerDataEncDec);
                fetchBill(consumerDataEncDec);
            } catch (error) { console.error('Error decrypting data:', error); }
        }
    }, [searchParams]);

    const finalLogo = whiteLabledLogo && whiteLabledLogo.trim() !== '' ? whiteLabledLogo : logo;

    const fetchBill = async (decryptedData) => {
       if(!sessionStorage.getItem('authToken')){
             const AppAxios = createAxiosInstance({ baseURL: API_URLS.appUrl, token: '' });
             try{
                  const response = await AppAxios('/api/PublicLogin?Publickey=EDTmqKo05ULepDN29RpTnlAcpBOYP8dZ4gZac3ioqCs=');
                  if (response.data.response_Code === '00') {
                    sessionStorage.setItem('authToken', response.data.auth_token);
                  }
              } catch (error) { console.error('Error fetching auth token:', error); }
       }
       const AppToken = sessionStorage.getItem('authToken');
       const AppAxios = createAxiosInstance({ baseURL: API_URLS.appUrl, token: AppToken });
        try {
            const { institutionID, kuickpayID } = decryptedData;
            const response = await AppAxios.get(`/api/SearchVoucher/${kuickpayID}/${institutionID}/92`);
            if (response.data.voucherData.response_Code === "00" && response.data.voucherData.bill_Status === "U") {
                setInquiryStatus(true);
                setVoucherData(response.data.voucherData);
                setInstitutionData(response.data.institution);
                const sessionQRstring = sessionStorage.getItem('QRstring');
                if(sessionQRstring === null){
                    generateQRCode(AppToken, institutionID, kuickpayID, response.data.voucherData.billAmount);
                } else{
                  setQRString(sessionQRstring);
                  setIsQrLoading(false);
                }
                if (response.data.institution.checkoutLogo) setwhiteLabledLogo(response.data.institution.checkoutLogo);
                setLogoLoader(false);
                sessionStorage.setItem('dataBus', EncryptionUtils.encryptText(JSON.stringify({ 
                    Institution: response.data.institution, 
                    voucherData: response.data.voucherData,
                    kuickpayID:kuickpayID,
                    whitelabledLogo:response.data.institution.checkoutLogo
                })));
                if (response.data.voucherData.due_Date) {
                    response.data.voucherData.due_Date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(response.data.voucherData.due_Date));
                } else {
                    response.data.voucherData.due_Date = 'N/A';
                }
            } else { 
              setVoucherData(response.data.voucherData);
              setInstitutionData(response.data.institution);
              if (response.data.institution.checkoutLogo) setwhiteLabledLogo(response.data.institution.checkoutLogo);
              setLogoLoader(false);
              setInquiryStatus(false);
            }
        } catch (error) { console.error('Error fetching API data:', error); }
    };

    const backtoHome = () => router.push('/');

    // ============================================
    // FIXED FUNCTION IS HERE
    // ============================================
    const generateQRCode = async (tokenization, institution, consumer, amount) => {
      // Loader shuru karein
      setIsQrLoading(true);
      
      const QRAxios = createAxiosInstance({ baseURL: "https://uatraast.kuickpay.com", token: tokenization });
      const payload = { 'InstitutionID': institution, 'ConsumerNumber': consumer, 'Amount': amount };
      
      try {
        const response = await QRAxios.post(`/api/Core/Raast/QR/Web/Dynamic`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Check if response exists and status is 200
        if (response && response.status === 200 && response.data.response_Code === '00') {
            setQRString(response.data.qrString);
            sessionStorage.setItem('QRstring', response.data.qrString);
        } else {
            setQRString("Error Generating QR");
        }
      } catch (error) { 
        console.error('Error generating QR:', error); 
        // Error ki soorat mein string update karein taake user ko pata chale
        setQRString("Network Error");
      } finally {
        // SUCCESS HO YA FAIL, LOADER BAND KARNA ZAROORI HAI
        setIsQrLoading(false);
      }
    };
    
    const CardPayNowOnClick = () => router.push(`/cardinfo`);

    const handleDownloadInvoice = async () => {
        if (!data || !data.kuickpayID || !data.institutionID) {
            alert("Invoice details are not yet available. Please wait and try again.");
            return;
        }

        setIsDownloading(true); // Loader shuru karein

        try {
            const consumerNo = data.kuickpayID;
            const institutionId = data.institutionID;
            const invoiceUrl = `https://uatmerchantapi.kuickpay.com/api/KPPrintVoucher/${consumerNo}/${institutionId}`;

            const response = await fetch(invoiceUrl);
            if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${consumerNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Sorry, the invoice could not be downloaded. Please try again later.");
        } finally {
            setIsDownloading(false); // Har haal mein loader band karein
        }
    };
    
    return (
        <div className="p-1 flex flex-col min-h-screen relative z-10" >
            <Header Heading="PAYLINK" logo={finalLogo} logoLoader={logoLoader} />
            <main className="flex-grow ">
                {inquiryStatus && voucherData && institutionData ? (  
                    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 relative">
                        {/* --- PAYMENT METHODS SECTION --- */}
                         <div className="w-full md:w-6/12 order-2 md:order-1">
                            <div className="mb-6">
<label className="block  text-center  font-outfit text-2xl p-2 text-slate-700">Select Payment Methods</label>
                                <p className="text-gray-500 text-center text-sm">Choose your preferred payment option below</p>
                            </div>

                            <div className="space-y-4">
                                
                                {/* 1. Card Payment */}
                                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                    <div 
                                        className="cursor-pointer p-5 flex justify-between items-center w-full hover:bg-gray-50 transition-colors"
                                        onClick={() => handleToggle(0)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                                                <Image src={CreditCardIcon} alt="Card Icon" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl text-gray-900 ">Pay via Cards & Bank Account</h3>
                                                <p className="text-sm text-gray-500">Instant payment processing</p>
                                            </div>
                                        </div>
                                        <div className={`text-gray-400 transform transition-transform duration-300 ${expanded === 0 ? "rotate-180" : ""}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                        </div>
                                    </div>
                                    
                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === 0 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-5 pt-0">
                                            <p className="text-xs italic text-gray-500 mb-4">"Quick, reliable, and secure card payments"</p>
                                            
                                            <button 
                                                onClick={CardPayNowOnClick} 
                                                className="w-full bg-btnBlue hover:text-btnBlue border hover:border-btnBlue text-white hover:bg-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-3 transition-colors shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                                </svg>
                                                Pay with Card
                                            </button>
                                            
                                            <button 
                                                onClick={CardPayNowOnClick} 
                                                className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                                                </svg>
                                                Pay with Bank Account
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. QR Payment */}
                                                             {/* 2. QR Payment - UPDATED UI */}
                                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                    <div 
                                        className="cursor-pointer p-5 flex justify-between items-center w-full hover:bg-gray-50 transition-colors"
                                        onClick={() => handleToggle(1)}
                                    >
                                        <div className="flex items-center  gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                                <Image src={QRCodeIcon} alt="QR Icon" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl text-gray-900 ">Pay via Raast QR</h3>
                                                <p className="text-sm text-gray-500">Scan & pay in seconds</p>
                                            </div>
                                        </div>
                                        <div className={`text-gray-400 transform transition-transform duration-300 ${expanded === 1 ? "rotate-180" : ""}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                        </div>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === 1 ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-6 pt-2 flex flex-col items-center">
                                            
                                            {/* Quote Text */}
                                            <p className="text-center italic text-gray-500 text-sm mb-8 mt-2">
                                                "Scan once, pay instantly - Modern payment made easy"
                                            </p>

                                            {/* Capture Area for Download */}
                                            <div ref={hiddenRef} className='bg-white flex flex-col items-center w-full max-w-md p-4'> 
                                                
                                                {/* QR Border Container */}
                                                <div className='border-[3px] border-purple-200 rounded-[2rem] p-6 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]'>  
                                                    {isQrLoading ? (
                                                        <div className="animate-pulse bg-gray-100 rounded-xl h-40 w-40 flex items-center justify-center">
                                                            <span className="text-xs text-gray-500">Loading QR...</span>
                                                        </div>
                                                    ) : (
                                                        // QR Color set to purple to match screenshot
                                                        <Canvas 
                                                            text={qRString} 
                                                            options={{ 
                                                                width: 180, 
                                                                margin: 0,
                                                                color: {
                                                                    dark: '#c084fc', // Purple color for QR dots
                                                                    light: '#ffffff',
                                                                }
                                                            }} 
                                                        />
                                                    )}
                                                </div>
                                                
                                                {/* Instructions */}
                                                <p className="text-gray-700 text-center text-lg mb-2">
                                                    Scan this QR code with your Raast-enabled banking app
                                                </p>
                                                
                                                {/* Amount - UPDATED HERE: TOFIXED(2) */}
                                                <p className="text-gray-500 text-center text-base">
                                                    Amount: <span className="text-gray-700">{institutionData.amount_Currency} {Number(voucherData.billAmount).toFixed(2)}</span>
                                                </p>
                                            </div>
                                            
                                            {/* Download Button (Optional - keep functionality) */}
                                            <button 
                                                className="mt-4 text-btnBlue hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors" 
                                                onClick={handleDownload}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l-3-3m0 0 3-3m-3 3h7.5" />
                                                </svg>
                                                Save to Gallery
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Internet Banking */}
                                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                    <div 
                                        className="cursor-pointer p-5 flex justify-between items-center w-full hover:bg-gray-50 transition-colors"
                                        onClick={() => handleToggle(2)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                                                <Image src={IntMobBankingIcon} alt="Banking Icon" className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl text-gray-900 ">Internet/Mobile Banking</h3>
                                                <p className="text-sm text-gray-500">Pay through your bank portal</p>
                                            </div>
                                        </div>
                                        <div className={`text-gray-400 transform transition-transform duration-300 ${expanded === 2 ? "rotate-180" : ""}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                        </div>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === 2 ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-6 pt-0">
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <strong className='text-gray-800 block mb-2'>Instructions:</strong>
                                                <ol className="list-decimal text-gray-600 pl-4 space-y-2 text-sm">
                                                    <li>Login to your Bank App or Website</li>
                                                    <li>Select Bill Payment &gt; Select <strong>KuickPay</strong></li>
                                                    <li className="flex flex-wrap items-center gap-1">
                                                        <span>Enter ID:</span>
                                                        <span className="font-mono bg-white border px-1 rounded">{data.kuickpayID}</span>
                                                        <button onClick={() => navigator.clipboard.writeText(data.kuickpayID)} className="text-blue-500 hover:text-blue-700">
                                                            <Image src={copyicon} alt="Copy" className="w-4 h-4" />
                                                        </button>
                                                    </li>
                                                    <li>Confirm details and Pay</li>
                                                </ol>
                                            </div>
                                            <div className="mt-4">
                                                <button onClick={() => setIsHowToPayModalOpen(true)} className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    See How to Pay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* --- INVOICE SUMMARY SECTION --- */}
                        <div className="w-full md:w-5/12 order-1  md:order-2 flex justify-center">
                            <div className="px-4 mt-10 py-3 xsize:w-full sm:w-full lg:w-12/12">
                                {/* CHANGED: Added bg-white, rounded-2xl, border-gray-100 to match left side */}
                                <div className='px-6 py-6 bg-white shadow-md rounded-2xl border border-gray-100'>                                
                                    <div className="flex justify-between items-center">
                                        <h2 className="heading tracking-widest  text-xl"> Invoice Summary</h2>
                                        <button 
                                            onClick={handleDownloadInvoice}
                                            disabled={isDownloading}
                                            className="content border rounded-lg px-3 py-1 text-md hover:bg-btnBlue hover:text-white flex items-center justify-center min-w-[150px] disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isDownloading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Downloading...</span>
                                                </>
                                            ) : (
                                                <span>Download Invoice</span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="border-t mt-5"></div>
                                    <div className="px-2 pt-2 flex justify-center items-center"><p className="xl:text-2xl uppercase font-normal text-[#505050]">{institutionData.institutionName}</p></div>
                                    <div className="px-2 pt-4 flex justify-between items-center"><p className="InvSumContent">Consumer Number:</p><p className="InvSumContent">{data.kuickpayID}</p></div>
                                    <div className="px-2 pt-2 flex justify-between items-center"><p className="InvSumContent">Name:</p><p className="InvSumContent ">{voucherData.consumer_Detail}</p></div>
                                    <div className="px-2 pt-2 flex justify-between items-center"><p className="InvSumContent">Due Date:</p><p className="InvSumContent">{voucherData.due_Date}</p></div>
                                    <div className="px-2 pt-2 flex justify-between items-center">
                                        <p className="InvSumContent">Status:</p>
                                        <p className={`${voucherData.bill_Status === "U" ? "text-red-500" : "text-green-500"} text-sm font-medium`}>{voucherData.bill_Status === "U" ? "Pending" : "Paid"}</p>
                                    </div>
                                    <div className="border-t mt-5"></div>
                                    <div className="px-2 pt-5 flex justify-between items-center"><p className="text-lg">Bill Amount:</p><p className="text-lg text-gray-600">{institutionData.amount_Currency} {Number(voucherData.billAmount).toFixed(2)}</p></div>
                                    <div className="xsmsize:border-t mt-5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Fallback for loading or non-inquiry status
                    <div>
                        {/* Skeleton Loader */}
                        {(!voucherData || !institutionData) ? (
                             <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 relative animate-pulse">
                                <div className="w-full py-3 md:w-6/12 order-2 md:order-1"><div className="h-6 bg-gray-200 rounded w-1/3 mb-6 ml-10"></div><div className="space-y-4"><div className="flex items-center p-4 border-b"><div className="h-8 w-20 bg-gray-200 rounded"></div><div className="ml-4 h-5 bg-gray-200 rounded w-48"></div></div><div className="flex items-center p-4 border-b"><div className="h-8 w-20 bg-gray-200 rounded"></div><div className="ml-4 h-5 bg-gray-200 rounded w-36"></div></div><div className="flex items-center p-4"><div className="h-8 w-20 bg-gray-200 rounded"></div><div className="ml-4 h-5 bg-gray-200 rounded w-56"></div></div></div></div>
                                <div className="w-full md:w-6/12 order-1 md:order-2 flex justify-center">
                                <div className="px-4 py-3 w-full lg:w-12/12">
                                    {/* CHANGED: rounded-2xl to match loader with new design */}
                                    <div className="px-4 py-3 shadow-sm rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-center"><div className="h-6 bg-gray-200 rounded w-1/2"></div><div className="h-8 bg-gray-200 rounded w-1/4"></div></div><div className="border-t mt-5"></div><div className="px-2 pt-4 flex justify-center items-center"><div className="h-7 bg-gray-200 rounded w-3/4"></div></div><div className="space-y-4 mt-4 px-2"><div className="flex justify-between items-center"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-4 bg-gray-200 rounded w-1/3"></div></div><div className="flex justify-between items-center"><div className="h-4 bg-gray-200 rounded w-1/5"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div><div className="flex justify-between items-center"><div className="h-4 bg-gray-200 rounded w-1/4"></div><div className="h-4 bg-gray-200 rounded w-1/3"></div></div><div className="flex justify-between items-center"><div className="h-4 bg-gray-200 rounded w-1/6"></div><div className="h-4 bg-gray-200 rounded w-1/4"></div></div></div><div className="border-t mt-5"></div><div className="px-2 pt-5 flex justify-between items-center"><div className="h-5 bg-gray-200 rounded w-1/4"></div><div className="h-5 bg-gray-200 rounded w-1/3"></div></div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        ) : (
                        // Message for Paid/Expired/Invalid Invoices
                        <div className="flex justify-center items-center p-8 mt-10">
                            <div className="w-full max-w-lg text-center p-6 bg-white shadow-md rounded-lg border border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Attention!</h2>
                                <div className="border-t my-4"></div>
                                <p className="text-gray-600 mb-4 text-lg">
                                    {voucherData.bill_Status === "P" ? `This invoice (ID: ${data?.kuickpayID}) has already been paid.` : `The invoice (ID: ${data?.kuickpayID}) is expired, blocked, or invalid. Please contact the biller for assistance.`}
                                </p>
                                <button onClick={backtoHome} className="mt-4 content-white bg-btnBlue border rounded hover:bg-blue-700 text-white px-6 py-2">Go to Homepage</button>
                            </div>
                        </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
            <HowToPayModal isOpen={isHowToPayModalOpen} onClose={() => setIsHowToPayModalOpen(false)} consumerId={data?.kuickpayID} />
        </div>
    );
};

// --- WRAPPER COMPONENT (Unchanged) ---
const PaymentInitilizationWithSuspense = () => (
    <Suspense fallback={<div>Loading Page...</div>}>
        <PaymentInitilization />
    </Suspense>
);

export default PaymentInitilizationWithSuspense;