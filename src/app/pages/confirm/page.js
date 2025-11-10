'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For navigation
import Header from '../../components/header';
import Footer from '../../components/footer';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { API_URLS } from '../../constants/config.js';
import axiosInstance, { createAxiosInstance } from '../../constants/axiosInstance';
import logo from '../../components/Images/kuickpay-logo.png';
import EncryptionUtils from "../../utils/encryptionUtils";
import encryptData from "../../utils/encrypText"


const PaymentConfirmation = () => {
  const router = useRouter();
  const [data, setData] = useState(null);
   const { decryptData } = require('../../utils/decryptUtils');
  const [token , setToken] = useState(null);

  const [feeData, setFeeData] = useState(null); // State to store platform fee
  const [isLoading, setIsLoading] = useState(false);
  const [cnic, setCnic] = useState("");
const [whiteLabledLogo, setwhiteLabledLogo] = useState(null);
     const [logoLoader, setLogoLoader] = useState(true);
 

  useEffect(() => {
    const fetchData = async () => {

      const checkoutAxios = createAxiosInstance({
        baseURL: API_URLS.gatewayUrl,
        token: '',
      });

      try {
        const GetDatafromInquiry = sessionStorage.getItem('dataBus');
        if (GetDatafromInquiry) {
          const decryptedData = JSON.parse(EncryptionUtils.decryptText(sessionStorage.getItem('dataBus')));
          ///console.log(decryptedData);
          if (decryptedData) {
            setData({
              voucherData: decryptedData.voucherData,
              institution: decryptedData.Institution,
              kuickpayID: decryptedData.kuickpayID,
            });

            if(decryptedData.whitelabledLogo !== ""){
             
              setwhiteLabledLogo(decryptedData.whitelabledLogo);
              setLogoLoader(false);
            }
            else{
              setLogoLoader(false);
            }

            // Fetch the bearer token
            const params =
              decryptedData.Institution?.institutionID +
              '4uNuf29HnlFG7PGwek8IRgx6gDhOaE8WiPUwYkM572zbuhnyzq6HsPtuVu9M3JbD';
            const encryptedData = EncryptionUtils.encryptText(params) // Encrypting the params
              // console.log(params);
              // console.log(encryptedData);
            const param = {
              ObjectValue: encryptedData,
            };
            // const gatewayTokenResponse = await checkoutAxios.post('/api/KPPublicToken', param);
            // const param = {
            //   ObjectValue: "EERCVsTSNRKoQfm48ZDRIlC8k20rS82mmDgz32Ze+tBkys6x985Mz/+Y8XqaXPsI7EEaaGkssnaHkjSxqGGM3dwEaOztwxf0yfZm7D9AUYo=",
            // };
            const gatewayTokenResponse = await axios.post(API_URLS.gatewayUrl+'/api/KPPublicToken', param);
            
            const { auth_token } = gatewayTokenResponse.data;
            
            setToken(auth_token);
   
            if (gatewayTokenResponse?.data?.responseCode === '00') {
              
              await fetchPlatformFee(auth_token, decryptedData);
              
             
            }
          }
        }
      } catch (error) {
        console.error('Error during API calls:', error);
      }
    };

    fetchData();
    
  }, []); // Run once on page load

   const finalLogo =
      whiteLabledLogo && whiteLabledLogo.trim() !== ''
              ? whiteLabledLogo
              : logo;

  const fetchPlatformFee = async (auth_token, decryptedData) => {
   
      const parsedData = JSON.parse(EncryptionUtils.decryptText(sessionStorage.getItem("localstored"))); // Parse the JSON string back to an object
      const cardNumber = parsedData.cardNumber.replace(/-/g, "").slice(0, 6); // Access the cardNumber field
      
    if(auth_token && cardNumber){
try {
  const platformFeeParams = {
    binNumber:  cardNumber,
    merchantId: decryptedData.Institution.institutionID,
    amount: decryptedData.voucherData.billAmount, // Use the correct property for amount
    orderID: decryptedData.kuickpayID,
    TranType: 'CARD',
  };

  const checkoutAxios = createAxiosInstance({
    baseURL: API_URLS.gatewayUrl,
    token: auth_token,
  });
  
  const response = await checkoutAxios.get('/Api/GetPlatformFee', {params: platformFeeParams,   // Adds query parameters to the GET request
  });

      if (response?.data?.responseCode === '00') {
        
         const FeeData =response.data;     //sessionStorage.setItem('getFee', encryptData(JSON.stringify(response.data)));
        
        setFeeData(FeeData);


       
      } else {
        console.error('Error fetching platform fee:', response.data);
      }
    } catch (error) {
      console.error('Error during GetPlatformFee API call:', error);
    }
  }
  };
  
  const PayNowButtonEvent = async () => {
    const savedData = EncryptionUtils.decryptText(sessionStorage.getItem("localstored")); // Retrieve the saved JSON string
     
      const parsedData = JSON.parse(savedData); // Parse the JSON string back to an object
      const cardNumber = parsedData.cardNumber.replace(/-/g, ""); // Access the cardNumber field
      const expiryMonth = parsedData.expiryMonth
      const expiryYear = parsedData.expiryYear.substring(2).toString()
      const cvv = parsedData.cvv
      console.log("Card Number:", cardNumber); // Output the 
    setIsLoading(true);
    const localstoredCardData = sessionStorage.getItem('localstored'); 
     console.log(localstoredCardData);
     
    const signatureHash = {"InstitutionID":data.institution.institutionID,"OrderID":data.kuickpayID,"Amount":feeData.payableAmount,"AmountFeeCalculated":feeData.amount}
    const stringifyHash = JSON.stringify(signatureHash);

    const payload = {
      institutionID: data.institution.institutionID,
      orderID: data.kuickpayID,
      customerEmail: data.institution.institutionEmail,
      customerMobile: data.institution.institutionMobile,
      returnURL: API_URLS.gatewayUrl + '/returnurl/',
      //amount: feeData.amount,
      cnic: '',
      CardNumber: EncryptionUtils.encryptText(cardNumber),//CardNumber.replace(/-/g, ""),
      SecurityCode: EncryptionUtils.encryptText(cvv),
      ExpiryMonth: EncryptionUtils.encryptText(expiryMonth),
      ExpiryYear: EncryptionUtils.encryptText(expiryYear),
      type: "Card",
      transactionDesc: 'PayLink',
      SaveInstrument: false,
      IsInternationalCard: false,
      SignatureHash: EncryptionUtils.encryptText(stringifyHash),
      CountryCode: '92',
      isEncrypt: true,
    };

    console.log(":Payload:");
    console.log(payload);
    console.log("::Payload::");
    

    try {
      
      const checkoutAxios = createAxiosInstance({
        baseURL: API_URLS.gatewayUrl,
        token: token,
      });
      
      const response = await checkoutAxios.post('/api/Validate', payload, {
        headers: {
          'Content-Type': 'application/json' // Ensuring the correct content type
           // Include token in Authorization header
        },
      });
    
          if(response?.status === 200)  {
            
            console.log("::Payload k andr wala::");

            console.log('institutionid', response?.data?.institutionID)
            sessionStorage.setItem("token",token)
            sessionStorage.setItem("orderID", data.kuickpayID);
            sessionStorage.setItem("transactionID", response?.data?.transactionID);
            sessionStorage.setItem("institutionID",  response?.data?.institutionID);
            // if (localstoredCardData.Instrument) {
            //   sessionStorage.setItem("instrument", localstoredCardData.Instrument);

            //   }
                  sessionStorage.setItem("cardSecurityCode", EncryptionUtils.encryptText(cvv));
                  sessionStorage.setItem("cardMonth", EncryptionUtils.encryptText(expiryMonth));
                  sessionStorage.setItem("cardYear", EncryptionUtils.encryptText(expiryYear));
                  sessionStorage.setItem("cardNumber", EncryptionUtils.encryptText(cardNumber));
              // }

              sessionStorage.setItem('amount', feeData.payableAmount),
              sessionStorage.setItem('billAmount', feeData.amount),
              sessionStorage.setItem("cnic", cnic.replace(/-/g, ""));
            //router.push(`/inquiry?data=${encodeURIComponent(encryptedData)}`);

            if (response?.data?.responseCode === "00" && response?.data?.returnHTML !== null) {

              

              sessionStorage.setItem("htmlContent", response?.data?.returnHTML);
              
               
                  router.push('./processHTML');
              
            }
          else 
          {
            console.error('Error PayNow Button Catch:', response.data);
          }
        }
        else if (response.status === 401) 
        {
        
        console.error('Session expired.', response.status);
        }
      else 
      {
      }
      } 
      catch (error) {
      console.error('Error during GetPlatformFee API call:', error);
      }
       


  };


  return (
    <div className="p-1 flex flex-col min-h-screen z-10">
     <Header 
                Heading="PAYMENT LINK" 
                logo={finalLogo}
                logoLoader={logoLoader}
              />
                   
    <main className="flex items-center justify-center pt-5 sm:ml-5 sm:mr-5">
      <div className="w-full max-h-100 md:w-5/12 xsize:w-10/12 order-1 md:order-2 mr-1 sm:mr-4 md:mr-8 lg:mr-6 flex justify-center">
        <div className="px-4 py-3 md:shadow-custom-shadow rounded lg:border:none md:border:none xs:border-none border-gray-300 xsize:w-full sm:w-full lg:w-10/12">
          {feeData ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="heading tracking-widest text-xl lg:text-xl md:text-md xsize:text-md">
                  Confirmation
                </h2>
              </div>
              <div className="border-t mt-2"></div>

              <div className="px-2 pt-4 flex justify-between items-center">
                <p className="InvSumContent">Bill Amount</p>
                <p className="InvSumContentweight">PKR {feeData.amount}0</p>
              </div>
              <div className="px-2 pt-2 flex justify-between items-center">
                <p className="InvSumContent">Platform fee</p>
                <p className="InvSumContentweight">PKR {feeData.platformFee}</p>
              </div>

              <div className="border-t mt-5"></div>
              <p className="px-2 pt-2 justify-between items-center lg:text-md md:text-md sm:text-sm xsize:text-xs">
                Your Platform Fee is Rs. for using a Visa Card
              </p>

              <div className="px-2 pt-5 flex justify-between items-center">
                <p className="text-lg font-light">Payable Amount</p>
                <p className="font-medium text-lg">PKR {feeData.payableAmount}</p>
              </div>

              <div className="flex items-center w-full py-2 mt-10 relative">
                <button
                  className="button-style"
                  onClick={PayNowButtonEvent}
                  disabled={isLoading}
                >
                  Pay now
                </button>
                {isLoading && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                 <div 
                   role="status"
                   className="flex items-center justify-center"
                 >
                   <svg
                     aria-hidden="true"
                     className="w-24 h- text-gray-200 animate-spin dark:text-gray-600 fill-btnBlue"
                     viewBox="0 0 100 101"
                     fill="none"
                     xmlns="http://www.w3.org/2000/svg"
                   >
                     <path
                       d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                       fill="currentColor"
                     />
                     <path
                       d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                       fill="currentFill"
                     />
                   </svg>
                   <span className="sr-only">Loading...</span>
                 </div>
               </div>
                )}
              </div>
            </>
          ) : (
            <div>
              {/* Page load skeleton here */}

              <div>
              {/* Loading State */}
              <div className="flex justify-between items-center">
                <h2 className="heading tracking-widest text-xl lg:text-xl md:text-md xsize:text-md">
                  Confirmation
                </h2>
              </div>
              <div className="border-t mt-2"></div>
              <div className="animate-pulse">
                <div className="px-2 pt-4 flex justify-between items-center">
                  <p className="InvSumContent bg-gray-300 h-4 w-24 rounded"></p>
                  <p className="InvSumContentweight bg-gray-300 h-4 w-20 rounded"></p>
                </div>
                <div className="px-2 pt-2 flex justify-between items-center">
                  <p className="InvSumContent bg-gray-300 h-4 w-24 rounded"></p>
                  <p className="InvSumContentweight bg-gray-300 h-4 w-20 rounded"></p>
                </div>
                <div className="border-t mt-5"></div>
                <p className="px-2 pt-2 bg-gray-300 h-4 w-48 rounded"></p>
                <div className="px-2 pt-5 flex justify-between items-center">
                  <p className="text-lg font-light bg-gray-300 h-4 w-24 rounded"></p>
                  <p className="font-medium text-lg bg-gray-300 h-4 w-20 rounded"></p>
                </div>
                <div className="flex items-center w-full py-2 mt-10">
                  <div className="button-style bg-gray-300 h-8 w-32 rounded"></div>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </main>

    <Footer />
  </div>
  );
};

export default PaymentConfirmation;
