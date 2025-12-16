'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For navigation
import Header from '../components/header';
import Footer from '../components/footer';
import InfoArea from '../components/InfoArea';
import Textbox from '../components/textbox';
import logo from '../components/Images/kuickpay-logo.png';
import CryptoJS from 'crypto-js';
import SearchIcon from '../components/svgs/cardinfo/search.svg';
import calendar from '../components/svgs/cardinfo/calendar.svg';

import card from '../components/svgs/cardinfo/cc.svg';

import lock from '../components/svgs/cardinfo/Vector.svg';
import EncryptionUtils from "../utils/encryptionUtils";

const CardInfo = () => {
  const router = useRouter();
    const [whiteLabledLogo, setwhiteLabledLogo] = useState(null);
     const [logoLoader, setLogoLoader] = useState(true);
     const { decryptData } = require('../utils/decryptUtils');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [cardScheme, setCardScheme] = useState(null); // Store the card scheme (Visa, Mastercard, etc.)
  const cardLogos = {
    visa: '/visa-logo.png', // Add your Visa logo URL
    mastercard: '/mastercard-logo.png', // Add your Mastercard logo URL
    amex: '/amex-logo.png', // Add your Amex logo URL
  };

  const [errors, setErrors] = useState({});

  // Refs for input fields
  const expiryMonthRef = useRef(null);
  const expiryYearRef = useRef(null);
  const cvvRef = useRef(null);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length > 16) value = value.slice(0, 16); // Limit to 16 digits
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1-'); // Add dashes after every 4 digits
    setCardNumber(formattedValue);

    // Move to expiry month when card number is complete
    if (value.length === 16) {
      expiryMonthRef.current.focus();
    }

    // Determine card scheme based on prefixes
    if (/^4/.test(value)) {
      setCardScheme('visa');
    } else if (/^5[1-5]/.test(value)) {
      setCardScheme('mastercard');
    } else if (/^3[47]/.test(value)) {
      setCardScheme('amex');
    } else {
      setCardScheme(null);
    }
  };

  const handleExpiryMonthChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length > 2) value = value.slice(0, 2); // Limit to 2 digits
    if (value > 12) value = '12'; // Ensure month is valid
    setExpiryMonth(value);

    // Move to expiry year when expiry month is complete
    if (value.length === 2) {
      expiryYearRef.current.focus();
    }
  };

  const handleExpiryYearChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length > 4) value = value.slice(0, 4); // Limit to 4 digits
    setExpiryYear(value);

    // Move to CVV when expiry year is complete
    if (value.length === 4) {
      cvvRef.current.focus();
    }
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length > 3) value = value.slice(0, 3); // Limit to 3 digits
    setCvv(value);
  };

  const validateForm = () => {
    const newErrors = {};

    // Card Number Validation (16 digits, numeric)
    const cardRegex = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    if (!cardRegex.test(cardNumber)) {
      newErrors.cardNumber = 'Enter a valid card number (16 digits in xxxx-xxxx-xxxx-xxxx format).';
    }

    // Expiry Month Validation (01-12)
    if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth)) {
      newErrors.expiryMonth = 'Enter a valid expiry month (01-12).';
    }

    // Expiry Year Validation (e.g., 2024 or higher)
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(expiryYear) || parseInt(expiryYear) < currentYear) {
      newErrors.expiryYear = 'Enter a valid expiry year (e.g., current year or later).';
    }

    // CVV Validation (3 digits)
    if (!/^\d{3}$/.test(cvv)) {
      newErrors.cvv = 'Enter a valid 3-digit CVV.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
      const formData = {
        cardNumber: cardNumber,       // Assuming cardNumber is managed in state
        expiryMonth: expiryMonth,     // Assuming expiryMonth is managed in state
        expiryYear: expiryYear,       // Assuming expiryYear is managed in state
        cvv: cvv,                     // Assuming cvv is managed in state
      };
  
  if (validateForm()) {
    sessionStorage.setItem("localstored", JSON.stringify(formData));

const getSessionvalue = sessionStorage.getItem("localstored");

    router.replace(`/confirm`);
  }
  };


    useEffect(() => {
        
      const GetDatafromInquiry = sessionStorage.getItem('dataBus');
        if (GetDatafromInquiry) {
          
          const decryptedData = JSON.parse(EncryptionUtils.decryptText(GetDatafromInquiry));
         
          if (decryptedData) {
            
            if(decryptedData.whitelabledLogo !== ""){
             
              setwhiteLabledLogo(decryptedData.whitelabledLogo);
              setLogoLoader(false);
            }
            else{
              setLogoLoader(false);
            }
             
          }
        }

    });

 const finalLogo =
    whiteLabledLogo && whiteLabledLogo.trim() !== ''
            ? whiteLabledLogo
            : logo;

  return (
    <div className="p-1 flex flex-col min-h-screen z-10">
      
      <Header 
                Heading="PAYMENT LINK" 
                logo={finalLogo}
                logoLoader={logoLoader}
              />
                    

      <div className="flex items-center justify-center pt-5 sm:ml-5 sm:mr-5">
        <InfoArea Text="Please Confirm with the bank if the card is enabled for online transactions." />
      </div>

      <main className="flex items-center justify-center pt-5 sm:ml-5 sm:mr-5">
        <div className="lg:w-4/12  md:shadow-custom-shadow sm:p-2 sm:py-2 sm:ml-5 sm:mr-5 md:p-4 md:py-4 lg:p-5 lg:py-5">
          <form onSubmit={handleSubmit} className="p-3 ">

            {/* Card Number */}
            <div className="mb-1 relative">
          <label htmlFor="card-number" className="block text-gray-600 mb-1">
          <p className="content">Card Number</p>
              </label>
              <div className="relative">
                
                <Textbox
                Icon={card}
                  type="text"
                  id="card-number"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000-0000-0000-0000"
                  className={`${
                    errors.cardNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {cardScheme && (
                  <img
                    src={cardLogos[cardScheme]}
                    alt={cardScheme}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8"
                  />
                )}
              </div>
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            {/* Expiry Month & Year */}
            <div className="grid grid-cols-2 gap-4 mb-1">
              <div>
                <label htmlFor="expiry-month" className="block text-gray-600 mb-1">
                  Expiry Month
                </label>
                <Textbox
                Icon={calendar}
                  ref={expiryMonthRef}
                  type="text"
                  id="expiry-month"
                  value={expiryMonth}
                  onChange={handleExpiryMonthChange}
                  placeholder="MM"
                  className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
                    errors.expiryMonth ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.expiryMonth && <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>}
              </div>
              <div>
                <label htmlFor="expiry-year" className="block text-gray-600 mb-1">
                  Expiry Year
                </label>
                <Textbox
                Icon={calendar}
                  ref={expiryYearRef}
                  type="text"
                  id="expiry-year"
                  value={expiryYear}
                  onChange={handleExpiryYearChange}
                  placeholder="YYYY"
                  className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
                    errors.expiryYear ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.expiryYear && <p className="text-red-500 text-sm mt-1">{errors.expiryYear}</p>}
              </div>
            </div>

            {/* CVV */}
            <div className="mb-1">
              <label htmlFor="cvv" className="block text-gray-600 mb-1">
                CVV
              </label>
              <Textbox
                Icon={lock}
                ref={cvvRef}
                type="password"
                id="cvv"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="***"
                className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 ${
                  errors.cvv ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
            </div>
          
            {/* Submit Button */}
            <div className="flex items-center  w-full py-2 mt-10">
            <button className="button-style" >
              Continue
            </button>
          </div>
          </form>
        </div>
      </main>
        
      <Footer />
    </div>
  );
};

export default CardInfo;
