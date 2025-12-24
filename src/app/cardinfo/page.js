'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/header';
import Footer from '../components/footer';
import Textbox from '../components/textbox';
import logo from '../components/Images/kuickpay-logo.png';
import EncryptionUtils from "../utils/encryptionUtils";
import axios from 'axios';
import { API_URLS } from '../constants/config'; 
import { createAxiosInstance } from '@/app/constants/axiosInstance';

// Import your SVGs
import card from '../components/svgs/cardinfo/cc.svg';
import lock from '../components/svgs/cardinfo/Vector.svg';

// Simple Icon placeholders (Updated Styling)
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CardInfo = () => {
  const router = useRouter();
  const [whiteLabledLogo, setwhiteLabledLogo] = useState(null);
  const [logoLoader, setLogoLoader] = useState(true);
  
  // States for Logic
  const [gatewayToken, setGatewayToken] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFeeCalculated, setIsFeeCalculated] = useState(false);

  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // --- SUMMARY STATE ---
  const [summaryData, setSummaryData] = useState({
    institutionID: "",
    kuickpayID: "",
    biller: "Loading...",
    consumerNumber: "",
    customerName: "",
    dueDate: "",
    amount: "0.00",
    currency: "PKR",
    institutionEmail: "",
    institutionMobile: "",
    platformFee: "0.00", 
    payableAmount: "0.00" 
  });

  const [cardScheme, setCardScheme] = useState(null);
  
  const [errors, setErrors] = useState({});

  // Refs
  const expiryMonthRef = useRef(null);
  const expiryYearRef = useRef(null);
  const cvvRef = useRef(null);

  // --- 1. LOAD DATA & GET TOKEN ON MOUNT ---
  useEffect(() => {
    const initializePage = async () => {
        const GetDatafromInquiry = sessionStorage.getItem('dataBus');
        if (GetDatafromInquiry) {
          try {
            const decryptedData = JSON.parse(EncryptionUtils.decryptText(GetDatafromInquiry));
            
            if (decryptedData && decryptedData.Institution && decryptedData.voucherData) {
              if (decryptedData.whitelabledLogo) setwhiteLabledLogo(decryptedData.whitelabledLogo);

              const initialData = {
                institutionID: decryptedData.Institution.institutionID,
                kuickpayID: decryptedData.kuickpayID,
                biller: decryptedData.Institution.institutionName,
                consumerNumber: decryptedData.kuickpayID,
                customerName: decryptedData.voucherData.consumer_Detail,
                dueDate: decryptedData.voucherData.due_Date,
                // --- FIXED: Initial Load par 2 decimals ensure kiye ---
                amount: Number(decryptedData.voucherData.billAmount).toFixed(2),
                currency: decryptedData.Institution.amount_Currency || "PKR",
                institutionEmail: decryptedData.Institution.institutionEmail,
                institutionMobile: decryptedData.Institution.institutionMobile,
                platformFee: "0.00",
                // --- FIXED: Initial Payable Amount par bhi 2 decimals ---
                payableAmount: Number(decryptedData.voucherData.billAmount).toFixed(2)
              };
              setSummaryData(initialData);

              // Generate Token
              const saltKey = '4uNuf29HnlFG7PGwek8IRgx6gDhOaE8WiPUwYkM572zbuhnyzq6HsPtuVu9M3JbD';
              const params = decryptedData.Institution.institutionID + saltKey;
              const encryptedParams = EncryptionUtils.encryptText(params).toString();
              
              try {
                  const tokenResponse = await axios.post(
                      'https://testcheckout.kuickpay.com/api/KPPublicToken', 
                      { ObjectValue: encryptedParams },
                      { 
                        headers: { 
                          'Content-Type': 'application/json' 
                        } 
                      }
                  );
                  
                  if (tokenResponse.data && tokenResponse.data.responseCode === '00') {
                      setGatewayToken(tokenResponse.data.auth_token);
                  } 
              } catch (tokenError) {
                  console.error("Token Generation Error:", tokenError);
              }

            }
          } catch (error) {
            console.error("Error decrypting initial data", error);
          }
        }
        setLogoLoader(false);
    };

    initializePage();
  }, []);

  // --- HANDLERS ---
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNumber(formattedValue);

    if (value.length === 16) expiryMonthRef.current?.focus();

    // LOGIC TO DETECT CARD SCHEME
    if (/^4/.test(value)) {
        setCardScheme('visa');
    } 
    else if (/^5/.test(value)) { 
        setCardScheme('mastercard');
    }
    else if (/^62/.test(value)) {
        setCardScheme('unionpay');
    }
    else if (/^3[47]/.test(value)) {
        setCardScheme('amex');
    }
    else {
        setCardScheme(null);
    }
  };

  const handleExpiryMonthChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2);
    if (parseInt(value) > 12) value = '12';
    setExpiryMonth(value);
    if (value.length === 2) expiryYearRef.current?.focus();
  };

  const handleExpiryYearChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setExpiryYear(value);
    if (value.length === 4) cvvRef.current?.focus();
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const validateForm = () => {
    const newErrors = {};
    const cardRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    
    if (!cardRegex.test(cardNumber)) newErrors.cardNumber = 'Invalid card number.';
    if (!cardHolderName.trim()) newErrors.cardHolderName = 'Name is required.';
    if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth)) newErrors.expiryMonth = 'Invalid Month.';
    
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(expiryYear) || parseInt(expiryYear) < currentYear) {
      newErrors.expiryYear = 'Invalid Year.';
    }
    if (!/^\d{3}$/.test(cvv)) newErrors.cvv = 'Invalid CVV.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!gatewayToken) {
        alert("Session initialization failed. Please refresh the page.");
        return;
    }

    if (!isFeeCalculated) {
        await fetchPlatformFee();
    } else {
        await processFinalPayment();
    }
  };

  const fetchPlatformFee = async () => {
      setIsProcessing(true);
      const cleanCard = cardNumber.replace(/-/g, "").slice(0, 6); 

      try {
          const platformFeeParams = {
              binNumber: cleanCard,
              merchantId: summaryData.institutionID,
              // --- FIXED: API ko bhejtay waqt bhi 2 decimals ---
              amount: Number(summaryData.amount).toFixed(2),
              orderID: summaryData.kuickpayID,
              TranType: 'CARD',
          };

          const checkoutAxios = createAxiosInstance({
              baseURL: API_URLS.gatewayUrl,
              token: gatewayToken,
          });

          const response = await checkoutAxios.get('/Api/GetPlatformFee', {
              params: platformFeeParams,
              headers: { 
                  'Content-Type': 'application/json'
              }
          });

          if (response?.data?.responseCode === '00') {
              setSummaryData(prev => ({
                  ...prev,
                  // --- FIXED: Response anay par bhi 2 decimals set kiye UI ke liye ---
                  platformFee: Number(response.data.platformFee).toFixed(2),
                  payableAmount: Number(response.data.payableAmount).toFixed(2)
              }));
              setIsFeeCalculated(true);
          } else {
              alert("Unable to calculate charges for this card.");
          }
      } catch (error) {
          console.error("Fee Calculation Error:", error);
          alert("Network error while calculating charges.");
      } finally {
          setIsProcessing(false);
      }
  };

  const processFinalPayment = async () => {
      setIsProcessing(true);
      const cleanCard = cardNumber.replace(/-/g, "");

      const signatureHash = { 
          "InstitutionID": summaryData.institutionID, 
          "OrderID": summaryData.kuickpayID, 
          // --- FIXED: Hash banatay waqt 2 decimals ensure kiye ---
          "Amount": Number(summaryData.payableAmount).toFixed(2), 
          "AmountFeeCalculated": Number(summaryData.amount).toFixed(2)
      };
      const stringifyHash = JSON.stringify(signatureHash);

      const payload = {
          institutionID: summaryData.institutionID,
          orderID: summaryData.kuickpayID,
          customerEmail: summaryData.institutionEmail,
          customerMobile: summaryData.institutionMobile,
          returnURL: API_URLS.gatewayUrl + '/returnurl/',
          cnic: '', 
          CardNumber: EncryptionUtils.encryptText(cleanCard),
          SecurityCode: EncryptionUtils.encryptText(cvv),
          ExpiryMonth: EncryptionUtils.encryptText(expiryMonth),
          ExpiryYear: EncryptionUtils.encryptText(expiryYear.slice(-2)), 
          type: "Card",
          transactionDesc: 'PayLink',
          SaveInstrument: false,
          IsInternationalCard: false,
          SignatureHash: EncryptionUtils.encryptText(stringifyHash),
          CountryCode: '92',
          isEncrypt: true,
      };

      try {
          const checkoutAxios = createAxiosInstance({
              baseURL: API_URLS.gatewayUrl,
              token: gatewayToken,
          });

          const response = await checkoutAxios.post('/api/Validate', payload, {
              headers: { 'Content-Type': 'application/json' }
          });

          if (response?.status === 200) {
              if (response?.data?.responseCode === "00" && response?.data?.returnHTML !== null) {
                  sessionStorage.setItem("htmlContent", response?.data?.returnHTML);
                  sessionStorage.setItem("token", gatewayToken);
                  sessionStorage.setItem("orderID", summaryData.kuickpayID);
                  sessionStorage.setItem("transactionID", response?.data?.transactionID);
                  // --- FIXED: Session mein bhi 2 decimals ke sath save kiya ---
                  sessionStorage.setItem("amount", Number(summaryData.payableAmount).toFixed(2));
                  
                  router.push('/processHTML');
              } else {
                  alert(response.data.message || "Transaction Failed");
              }
          } else {
              alert("Server responded with status: " + response.status);
          }
      } catch (error) {
          console.error("Payment Process Error:", error);
          alert("An error occurred during payment processing.");
      } finally {
          setIsProcessing(false);
      }
  };

  const finalLogo = whiteLabledLogo && whiteLabledLogo.trim() !== '' ? whiteLabledLogo : logo;

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F7FA]">
      <Header Heading="" logo={finalLogo} logoLoader={logoLoader} />

      <div className="flex-grow flex flex-col items-center pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-4">
          <h1 className="text-3xl font-normal text-[#1B365D]">Enter Card Details</h1>
          <p className="text-gray-500 text-sm mt-1 italic">"Your security is our priority - Pay with confidence"</p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* --- LEFT COLUMN: Payment Summary --- */}
          <div className="flex flex-col gap-2">
            
            {/* 1. PAYMENT SUMMARY CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 lg:p-4 transition-all duration-300">
              <div className="border-b border-gray-200 pb-2 mb-4">
                <h2 className="text-lg p-1   text-center text-gray-800">Payment Summary</h2>
                <p className="text-gray-400 text-center text-xs">Verify your payment details</p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Biller:</span>
                  <span className=" text-gray-500 uppercase">{summaryData.biller}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Consumer Number:</span>
                  <span className=" text-gray-500">{summaryData.consumerNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className=" text-gray-500">{summaryData.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Due Date:</span>
                  <span className=" text-gray-500">{summaryData.dueDate}</span>
                </div>
                
                <hr className="border-gray-100 my-2" />
                
                {isFeeCalculated && (
                    <div className="flex justify-between items-center animate-fade-in-down">
                        <span className="text-gray-500">Bill Amount:</span>
                        <span className="font-semibold text-gray-700">{summaryData.currency} {summaryData.amount}</span>
                    </div>
                )}

                {isFeeCalculated && (
                    <div className="flex justify-between items-center animate-fade-in-down">
                        <span className="text-gray-500">Platform Fee:</span>
                        <span className="font-bold text-gray-700">{summaryData.currency} {summaryData.platformFee}</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t mt-2">
                  <span className="text-gray-600 font-bold text-lg">Total Payable:</span>
                  <span className="text-xl font-bold text-green-600">
                      {summaryData.currency} {isFeeCalculated ? summaryData.payableAmount : summaryData.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SECURITY CARD */}
            <div className="bg-[#F0FDF4] border border-green-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="mt-0.5 text-green-600">
                   <ShieldIcon />
                </div>
                <div>
                  <h4 className="text-[#166534] font-medium text-base">Secure Payment</h4>
                  <p className="text-[#15803d] text-sm mt-0.5">Your payment is protected by 256-bit SSL encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-0.5 text-green-600">
                   <CheckCircleIcon />
                </div>
                <div>
                  <h4 className="text-[#166534] font-medium text-base">PCI Compliant</h4>
                  <p className="text-[#15803d] text-sm mt-0.5">We never store your CVV or sensitive card data</p>
                </div>
              </div>
            </div>

            {/* 3. QUOTE CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center justify-center gap-2">
               <span className="text-xl">💳</span>
               <p className="text-gray-500 text-sm italic">"Fast, secure, and hassle-free card payments"</p>
            </div>

          </div>

          {/* --- RIGHT COLUMN: Card Details Form --- */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 relative">
            
            {/* Loading Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center rounded-lg">
                    <svg className="animate-spin h-10 w-10 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 font-medium">
                        {isFeeCalculated ? "Processing Payment..." : "Calculating Charges..."}
                    </p>
                </div>
            )}

            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <img src={card.src} alt="card" className="w-6 h-6 text-gray-600" />
                <h2 className="text-lg font-outfit text-gray-800">Card Details</h2>
              </div>
              <p className="text-gray-400 text-xs mt-1">All fields are required</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Card Number */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                    <Textbox
                      Icon={card}
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      disabled={isFeeCalculated}
                      className={`w-full bg-gray-50 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-200'} rounded-md py-2 pl-10    text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400`}
                    />
                    
                    {cardScheme === 'visa' && (
                        <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                        alt="Visa"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-auto"
                        />
                    )}
                    
                    {cardScheme === 'mastercard' && (
                        <img
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                        alt="Mastercard"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-auto"
                        />
                    )}

                    {cardScheme === 'unionpay' && (
                        <img
                        src="https://upload.wikimedia.org/wikipedia/commons/1/1b/UnionPay_logo.svg"
                        alt="UnionPay"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-auto"
                        />
                    )}
                    
                </div>
                {errors.cardNumber && <p className="text-red-500 text-[10px] mt-0.5">{errors.cardNumber}</p>}
              </div>

              {/* Card Holder Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Card Holder Name</label>
                <Textbox
                   Icon={null}
                   type="text"
                   value={cardHolderName}
                   onChange={(e) => setCardHolderName(e.target.value)}
                   placeholder="Moiz Pasha."
                   disabled={isFeeCalculated}
                   className={`w-full bg-gray-50 border ${errors.cardHolderName ? 'border-red-500' : 'border-gray-200'} rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400`}
                />
                {errors.cardHolderName && <p className="text-red-500 text-xs mt-1">{errors.cardHolderName}</p>}
              </div>

              {/* Expiry Month, Year, and CVV */}
              <div className="grid grid-cols-3 gap-4">
                
                {/* 1. Expiry Month */}
                <div>
                   <label className="block text-sm text-gray-700 mb-1">Expiry Month</label>
                   <Textbox
                      Icon={null}
                      ref={expiryMonthRef}
                      value={expiryMonth}
                      onChange={handleExpiryMonthChange}
                      placeholder="MM"
                      disabled={isFeeCalculated}
                      className={`w-full bg-gray-50 border ${errors.expiryMonth ? 'border-red-500' : 'border-gray-200'} rounded-md p-2.5 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400`}
                   />
                </div>

                {/* 2. Expiry Year */}
                <div>
                   <label className="block text-sm text-gray-700 mb-1">Expiry Year</label>
                   <Textbox
                      Icon={null}
                      ref={expiryYearRef}
                      value={expiryYear}
                      onChange={handleExpiryYearChange}
                      placeholder="YYYY"
                      disabled={isFeeCalculated}
                      className={`w-full bg-gray-50 border ${errors.expiryYear ? 'border-red-500' : 'border-gray-200'} rounded-md p-2.5 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400`}
                   />
                </div>

                {/* 3. CVV */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">CVV</label>
                  <div className="relative">
                    <Textbox
                      Icon={null}
                      ref={cvvRef}
                      type="password"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      disabled={isFeeCalculated}
                      className={`w-full bg-gray-50 border ${errors.cvv ? 'border-red-500' : 'border-gray-200'} rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Common Error Message for Dates/CVV */}
              {(errors.expiryMonth || errors.expiryYear || errors.cvv) && 
                  <p className="text-red-500 text-xs mt-1">Please check Month , Year or CVV</p>
              }

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isProcessing}
                  // UPDATED CLASSNAME HERE: Removed color hover, added scale-105
                  className={`w-full font-medium py-3 rounded-md shadow-sm transition-all duration-200 flex justify-center items-center gap-2
                    ${isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : isFeeCalculated 
                            ? 'bg-green-600 text-white hover:scale-105' 
                            : 'bg-[#1B75D0] text-white hover:scale-105'
                    }`}
                >
                   {isProcessing ? (
                       <span>Processing...</span>
                   ) : isFeeCalculated ? (
                       <>
                         <img src={lock.src} alt="lock" className="w-4 h-4 brightness-0 invert" /> 
                         Confirm & Pay {summaryData.currency} {summaryData.payableAmount}
                       </>
                   ) : (
                       <>
                         <img src={lock.src} alt="lock" className="w-4 h-4 brightness-0 invert" /> 
                         Pay 
                       </>
                   )}
                </button>
                
                {isFeeCalculated && !isProcessing && (
                    <button 
                        type="button" 
                        onClick={() => {
                            // Reset Logic State
                            setIsFeeCalculated(false);
                            setSummaryData(prev => ({...prev, platformFee: "0.00", payableAmount: prev.amount}));

                            // Reset Form Fields
                            setCardNumber('');
                            setCardHolderName('');
                            setExpiryMonth('');
                            setExpiryYear('');
                            setCvv('');
                            setCardScheme(null);
                            setErrors({});
                        }}
                        className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Change Card Details
                    </button>
                )}
              </div>
            </form>

             <div className="  border-t border-gray-100 flex flex-col items-center">
                <p className="text-gray-400 text-xs mt-2 mb-3">We accept</p>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">VISA</span>
                   <span className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">Mastercard</span>
                   <span className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">UnionPay</span>
                </div>
             </div>

          </div>
        </div>
      </div>
        
      <Footer />
    </div>
  );
};

export default CardInfo;