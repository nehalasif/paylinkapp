'use client';

import React, { useEffect, useState,useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useQRCode } from 'next-qrcode';
import axiosInstance, { createAxiosInstance } from '../../constants/axiosInstance'; 
import CryptoJS from 'crypto-js';
import Image from 'next/image';
import CreditCardIcon from '../../components/svgs/CreditCard.svg';
import IntMobBankingIcon from '../../components/svgs/intMbanking.svg';
import QRCodeIcon from '../../components/svgs/QR.svg';
import copyicon from '../../components/svgs/copy.svg';
import qrgen from '../../components/Images/qrgen.png';
import Header from '../../components/header';
import Footer from '../../components/footer';
import PoweredByPFRaast from '../../components/svgs/poweredby.svg';
import logo from '../../components/Images/kuickpay-logo.png';
import logosvg from '../../components/svgs/kuickpay.svg';

import { API_URLS } from '../../constants/config';
import html2canvas from 'html2canvas';
import EncryptionUtils from "../../utils/encryptionUtils";


const PaymentInitilization = () => {

    const [expanded, setExpanded] = useState(null); // State to track which payment method is expanded

    const handleToggle = (index) => {
        setExpanded(expanded === index ? null : index); // Toggle between expand and collapse
    };
    const [data, setData] = useState(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [voucherData, setVoucherData] = useState(null);
    const [institutionData, setInstitutionData] = useState(null);
    const [isQrLoading,setIsQrLoading] = useState(true);
    const [inquiryStatus, setInquiryStatus] = useState(false);
   
    const [isWhiteLabled, setIsWhilteLabled] = useState(false);
    const [whiteLabledLogo, setwhiteLabledLogo] = useState(null);
     const [logoLoader, setLogoLoader] = useState(true);
    const { encryptData } = require('../../utils/encrypText');
    const { decryptData } = require('../../utils/decryptUtils');
    const [qRString ,setQRString] = useState("Waiting for Data");
    const hiddenRef = useRef();
    const { Canvas } = useQRCode();
  
    const handleDownload = async () => {
      if (hiddenRef.current) {
        try {
          const canvas = await html2canvas(hiddenRef.current, {
            scale: 10, // Higher scale for better quality
            useCORS: true, // Handles cross-origin images
          });
  
          // Convert the canvas to an image
          /////const imgData = canvas.toDataURL('image/png');
  
          // Trigger download
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'RaastBillPaymentQR.png';
          link.click();
        } catch (error) {
          console.error('Error capturing element:', error);
        }
      }
    };
  

    useEffect(() => {
        const consumerDataEnc = searchParams.get('data');
        //console.log(consumerDataEnc,"Before dec");
        if (consumerDataEnc) {
            try {
                 const consumerDataEncDec = JSON.parse(EncryptionUtils.decryptText(consumerDataEnc)); // Use the same key
                 //console.log(consumerDataEncDec,"Deceptted");
                if(!consumerDataEncDec.kuickpayID){
                  //router.replace('/');
                }
                setData(consumerDataEncDec);
                
                fetchBill(consumerDataEncDec);
            } catch (error) {
                console.error('Error decrypting data:', error);
                //alert('Invalid or corrupted data!');
                //router.push('/'); // Redirect to the home page on error
            }
        } else {
          console.error('Error decrypting data:', error);
            //alert('No data found in the query string!');
            //router.push('/'); // Redirect to the home page
        }
    }, [searchParams]);

    
    

    const finalLogo =
    whiteLabledLogo && whiteLabledLogo.trim() !== ''
            ? whiteLabledLogo
            : logo;

    useEffect(() =>{

     
    });

    const fetchBill = async (decryptedData) => {
     
      ////console.log(sessionStorage.getItem('authToken'),"Session Variable");
       if(!sessionStorage.getItem('authToken')){
        
             const AppAxios = createAxiosInstance({
                    baseURL: API_URLS.appUrl,
                    token: '',
                  });
        
             try{
                  const response = await AppAxios(
                  '/api/PublicLogin?Publickey=EDTmqKo05ULepDN29RpTnlAcpBOYP8dZ4gZac3ioqCs='
                );
                if (response.data.response_Code === '00') {
                   
                   sessionStorage.setItem('authToken', response.data.auth_token);
                  } else {
                  console.error('Failed to fetch auth token:', response.data);
                }
              } catch (error) {
                console.error('Error fetching auth token:', error);
              }
       }

       const AppToken = sessionStorage.getItem('authToken');

       const AppAxios = createAxiosInstance({
            baseURL: API_URLS.appUrl,
            token: AppToken,
          });
      
        try {
            
            const { institutionID, kuickpayID } = decryptedData;
            const countrycode = '92'; // Fixed value as per the example
            
            const response = await AppAxios.get(`/api/SearchVoucher/${kuickpayID}/${institutionID}/${countrycode}`);
            
            if (response.data.voucherData.response_Code == "00" && response.data.voucherData.bill_Status == "U") {
             
             // //console.log("::::::::::::Only when response code 00 and status U ::::::::::::");
                setInquiryStatus(true)
                setVoucherData(response.data.voucherData);
                setInstitutionData(response.data.institution);
                //console.log(response.data);
                // //console.log(response.data.voucherData);
                const token =sessionStorage.getItem('authToken');
                //QR Generation //
                const sessionQRstring =sessionStorage.getItem('QRstring');
               
                if(sessionQRstring === null){
                 
                generateQRCode(token, institutionID, kuickpayID, response.data.voucherData.billAmount);
                //QR Generation //
                }
                else{
                  // //console.log("exist");
                  // //console.log(sessionQRstring);
                  setQRString(sessionQRstring);
                  setIsQrLoading(false)
                }
                if (response.data.institution.checkoutLogo !== '') {
                  
                  setIsWhilteLabled(true);
                  setwhiteLabledLogo(response.data.institution.checkoutLogo);
                 
                  setLogoLoader(false);
                }
                else{
                  setLogoLoader(false);
                }
                 // //console.log(response.data.institution.checkoutLogo.trim());
                 const dataBus = { 
                  Institution: response.data.institution, 
                  voucherData: response.data.voucherData,
                  kuickpayID:kuickpayID,
                  whitelabledLogo:response.data.institution.checkoutLogo

                 };

                
                sessionStorage.setItem('dataBus', EncryptionUtils.encryptText(JSON.stringify(
                  { 
                    Institution: response.data.institution, 
                    voucherData: response.data.voucherData,
                    kuickpayID:kuickpayID,
                    whitelabledLogo:response.data.institution.checkoutLogo
  
                   }
                )));
                ////console.log(response.data.institution.checkoutLogo);
               
                // Check if due_date exists and is valid, then format it
                if (response.data.voucherData.due_Date && !isNaN(new Date(response.data.voucherData.due_Date))) {
            // Format the date directly inside voucherData
                    response.data.voucherData.due_Date = new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    }).format(new Date(response.data.voucherData.due_Date));
                } else {
                    // If invalid or no due date, set it to 'N/A'
                    response.data.voucherData.due_Date = 'N/A';
                }

            }
            else { 
              
              setVoucherData(response.data.voucherData);
              setInstitutionData(response.data.institution);
              //console.log(response.data.institution);
              //console.log(response.data.voucherData);
              if (response.data.institution.checkoutLogo !== '') {
                  
                setIsWhilteLabled(true);
                setwhiteLabledLogo(response.data.institution.checkoutLogo);
               
                setLogoLoader(false);
              }
              else{
                setLogoLoader(false);
              }
                if(response.data.voucherData.response_Code == "01")
                  {
                      //console.log(":::::::: Invalid Voucher:::::::::")
                  }
                  else if(response.data.voucherData.response_Code == "02")
                  {
                    //console.log(":::::::: Expired/Blocked Voucher:::::::::")
                  }
                  setInquiryStatus(false)

            }
            // else {

            //     //console.log('Response code:', response.data.response_code);
            // }

        } catch (error) {
            console.error('Error fetching API ----data:', error);
        }
    };

   const backtoHome = async () =>{
    router.push('/');
   }

    const generateQRCode = async (tokenization, institution, consumer, amount) => {
      const QRAxios = createAxiosInstance({
        baseURL: "https://uatraast.kuickpay.com",
        token: tokenization,
      });
      //const authToken = tokenization;
      //console.log("🚀 ~ qrcode ~  institution, consumer, amount:", institution, consumer, amount)
      const payload = {
          'InstitutionID': institution,
          'ConsumerNumber': consumer,
          'Amount': amount,
      };
      try {
        ////console.log("🚀 ~ qrcode ~  institution, consumer, amount:",payload)
        const response = await QRAxios.post(`/api/Core/Raast/QR/Web/Dynamic`, payload);
        ////console.log("🚀 ~ qrcode ~  institution, consumer, amount:", response)
        if (response.status === 200) {
         


              
              if (response.data.response_Code === '00') {
                 
                  setQRString(response.data.qrString);
                  sessionStorage.setItem('QRstring',response.data.qrString)
                  setIsQrLoading(false)
              } else {
                  console.error('Error:', json.message);
                  toast.error('Cannot Generate Qr at this time');
                  setIsQrLoading(true);
              }
          } else {
              console.error('Failed to fetch QR Code, status:', res.status);
          }
      } catch (secondEx) {


      }

  };
    

    const CardPayNowOnClick = () =>
      {

          router.push(`/pages/cardinfo`);


      } 
      
      const HandleHowtoPay = () => {
        window.location.href = 'https://app2.kuickpay.com/PaymentsBillPayment';
      };
      
      
    return (
        
        <div className="p-1 flex flex-col min-h-screen relative z-10" >
            {/* Logo Section */}

            {/* <Header Heading={"PAYMENT LINK"}  logo={whiteLabledLogo}/> */}
            {/* <Header Heading={"PAYMENT LINK"} logo={logo} width={200} height={50} /> */}
            <Header 
                Heading="PAYLINK" 
                logo={finalLogo}
                logoLoader={logoLoader}
              />



            <main className="flex-grow ">

            {inquiryStatus && voucherData ? (  
              <div>
            {voucherData && institutionData ? (
                <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 relative">
               
                    <div className="w-full py-3 md:w-6/12 order-2 md:order-1   ">

                        <h2 className="ml-10 content tracking-widest text-xl lg:text-lg md:text-sm xsize:text-md"> Payment Methods</h2>
                        <div className=" xsize:mr-10">
                           
                            <div className="flex items-center" onClick={() => handleToggle(0)}>
                                <div className="cursor-pointer p-4 flex justify-between items-center" >

                                    <div className="content flex items-center">
                                        <Image src={CreditCardIcon} alt="My Icon" className="w-20 h-8" />
                                        <span className='p-4 text-md xsize:text-sm '>Pay via Cards & Bank Account</span>
                                    </div>

                                </div>
                                <div className={`content transform transition-transform ${expanded === 0 ? "rotate-180" : ""} ml-auto`}>

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>


                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all  duration-500 ease-in-out ${expanded === 0 ? 'max-h-96' : 'max-h-0'}`}>

                                <div className="flex justify-end">
                               
                                    

<div className="buttonbutton flex lg:flex-row justify-end items-end  w-full gap-x-3">
  <button 
    onClick={CardPayNowOnClick}
    className="content-white bg-btnBlue border-bg-btnblue border-x border-y rounded hover:text-slate-950 hover:bg-transparent hover:border-x hover:border-y hover:border-black text-white px-5 py-2 xsize:text-xs xsize:px-2 xsize:py-1">
    Pay via Debit/Credit Card
  </button>
  <button 
    onClick={CardPayNowOnClick}
    className="content-white bg-btnBlue border-bg-btnblue border-x border-y rounded hover:text-slate-950 hover:bg-transparent hover:border-x hover:border-y hover:border-black text-white px-5 py-2 xsize:text-xs xsize:px-2 xsize:py-1">
    Pay via Bank Acc.
  </button>
</div>


                                </div>
                            </div>

                          
                            <div className="border-t my-2"></div>

                            <div className="flex items-center" onClick={() => handleToggle(1)}>
                                <div className="cursor-pointer p-4 flex justify-between items-center" >

                                    <div className="content flex items-center">
                                        <Image src={QRCodeIcon} alt="My Icon" className="w-20 h-8" />
                                        <span className=' p-4 xsize:pl-0 text-md xsize:text-sm '> Pay via Raast QR</span>
                                    </div>

                                </div>
                                <div className={`content transform transition-transform ${expanded === 1 ? "rotate-180" : ""} ml-auto `}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>


                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === 1 ? 'max-h-[500px]' : 'max-h-0'}`}>

                                <div className="ml-5 flex w-full px-2 xsize:px-0">
                                    <div className="cursor-pointer flex" >

                                        <div className="flex flex-col w-full justify-center items-center">
                                            {/* <Image src={qrgen} alt="qrgen" className="w-40 h-30" /> */}
              
                                            <div ref={hiddenRef} className=' justify-center lg:w-6/6 mt-1 xsize:w-[90%] '
                                                          style={{
                                                            textAlign: 'center',
                                                            padding: '10px',
                                                            backgroundColor: '#F5F7FA',
                                                            marginTop: '5px',
                                                            borderRadius: '5px',
                                                            boxShadow: '0px 0px 6px rgba(0, 0, 0, 0.1)',
                                                          }} > 
                                                        
                                                            <div className='flex justify-center' >  
                                                             
                                                             <Image src={logosvg } alt="My Icon" width={150} height={100} />
                                                             </div>
                                                          <p style={{ fontSize: '14px', color: '#666' }}>
                                                            Bill Payment QR
                                                          </p>
                                                         
                                                          <p style={{ fontSize: '10px', color: '#999', marginBottom: '20px' }}>
                                                          Scan the QR code below and complete your payment<br></br> quickly and securely.
                                                          </p>

                                                          {/* QR Code */}
                                                        <div className='flex justify-center py-2 ' >  
                                                        {isQrLoading ? (
        // Animated Loader
                                                              <div
                                                                      className="animate-pulse bg-customPulseColor "
                                                                      style={{
                                                                        padding: '10px',
                                                                        display: 'inline-block',
                                                                        
                                                                        backgroundSize: 'cover',
                                                                        backgroundPosition: 'center',
                                                                        width: '120px', // Match size of the Canvas
                                                                        height: '120px', // Match size of the Canvas
                                                                        borderRadius: '8px', // Optional for rounded corners
                                                                      }}
                                                                    >
                                                                      {/* Simulated QR code placeholder */}
                                                                      <div className='bg-customPulseColor '
                                                                       
                                                                      >
                                                                        <p className='items-center mt-11 text-[11px]' > Fetching QR-CODE</p>
                                                                      </div>
                                                                    </div>
                                                                  ) : (
                                                                    
                                                                    <div style={{ padding: '10px', display: 'inline-block', backgroundSize: 'cover', backgroundPosition: 'center', }}>
                                                                                                                          
                                                                                                                      <Canvas
                                                                                                                        text={qRString}
                                                                                                                        options={{
                                                                                                                          width: 100,
                                                                                                                          margin: 1,
                                                                                                                          color: '',
                                                                                                                          bgColor: '#F5F7FA',
                                                                                                                        }}
                                                                                                                        
                                                                                                                      />
                                                                                                                      </div>

                                                                  )}
                                                          </div>
                                                         
                                                          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                                                          {institutionData.amount_Currency} {voucherData.billAmount}
                                                          </p>
                                                         
                                                          <p className='xsize:text-[10px] lg:text-[12px] ' style={{ color: '#999' }}>This QR code will expire on {voucherData.due_Date}</p>
                                                          <div className='flex justify-center' >  
                                                             <Image src={PoweredByPFRaast} alt="My Icon" className="w-14"  />
                                                             </div>
                                                </div>
                                              <div className="button pt-3 ">
                                              <button className="content-white  bg-btnBlue border-bg-btnblue border-x border-y rounded hover:text-slate-950 hover:bg-transparent hover:border-x hover:border-y hover:border-black text-white px-5 py-2 xsize:text-sm xsize:px-2 xsize:py-1" 
                                              onClick={handleDownload}>
                                                  Save To Gallery
                                              </button>
                                                  </div>
                                               
                                                     
                                        </div>

                                    </div>
                                   
                                    


                                </div>
                            </div>

                            {/* Payment Mode 2: Pay with QR */}

                            {/* Line Break */}
                            <div className="border-t my-2"></div>
                            <div className="flex items-center" onClick={() => handleToggle(2)}>
                                <div className="cursor-pointer p-4 flex justify-between items-center" >

                                    <div className="content flex items-center">
                                        <Image src={IntMobBankingIcon} alt="My Icon" className="w-20 h-8" />
                                        <span className='p-4 text-md xsize:text-sm '>Internet/Mobile Banking</span>
                                    </div>

                                </div>
                                <div className={`content transform transition-transform ${expanded === 2 ? "rotate-180" : ""} ml-auto`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>


                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded === 2 ? 'max-h-96' : 'max-h-0'}`}>
                                <div className='content ml-10 md:text-sm xsize:text-xs'>

                               <div>
                                      <strong>Mobile Banking:</strong>
                                      <ol className="list-decimal pl-5 mt-2 space-y-1">
                                        <li>Login to your Bank Mobile App</li>
                                        <li>Select Bill Payment</li>
                                        <li>
                                          Select <strong>KuickPay</strong>
                                        </li>
                                        <li className="flex flex-wrap items-center gap-1 sm:gap-2">
                                      <span className="whitespace-nowrap">Enter Consumer ID:</span>
                                      <span className="ml-1 font-semibold">{data.kuickpayID}</span>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(data.kuickpayID)}
                                        className="mx-1 sm:mx-1 w-5 h-5 flex justify-center items-center text-gray-600 hover:text-blue-500 active:scale-150 transition-all duration-550"
                                      >
                                        <Image src={copyicon} alt="Copy Icon" className="w-4 h-4" />
                                      </button>
                                      <span className="whitespace-nowrap">and Submit</span>
                                    </li>
                                        <li>Confirm details and Pay</li>
                                      </ol>
                                    </div>


                                </div>
                                <div className="flex justify-end">
                                <div className="buttonbutton flex flex-col sm:flex-row justify-end items-end pr-5 w-full ">
                                
                                                                  
                                        
                                       <button 
                                        onClick={HandleHowtoPay}
                                        className="content-white bg-btnBlue border-bg-btnblue border-x border-y rounded hover:text-slate-950 hover:bg-transparent hover:border-x hover:border-y hover:border-black text-white px-5 py-2 xsize:text-sm xsize:px-2 xsize:py-1" >
                                           See How to Pay</button>
                                    </div>
                                    

                                </div>
                            </div>
                        </div>

                    </div>
                     

                        <div className=" w-full max-h-100 md:w-6/12 order-1 md:order-2 mr-1 sm:mr-4 md:mr-8 lg:mr-6 flex justify-center">

                                                            
                            <div className="px-4 py-3  xsize:w-full sm:w-full lg:w-12/12  ">
                                <div className='px-4 py-3 shadow-custom-shadow rounded lg:border md:border xs:border-none  border-gray-300 xsize:w-full sm:w-full lg:w-12/12  '>                                
                                <div className="flex justify-between items-center ">
                                    <h2 className="heading tracking-widest text-xl lg:text-xl md:text-md xsize:text-md"> Invoice Summary</h2>
                                    <button className="content  border-bg-btnblue border-x border-y rounded px-3 py-1 w-auto text-xl lg:text-md md:text-sm xsize:text-xs hover:bg-btnBlue  hover:text-white">
                                        Download Invoice
                                    </button>
                                </div>

                                {/* Main Content started */}
                                <div className="border-t mt-5"></div>

                                <div className="px-2 pt-2 flex text-xl justify-center items-center">
                                    <p className="xl:text-2xl lg:text-2xl md:text-2xl  sm:text-1xl xs-text-xs uppercase font-normal text-[#505050]">           
                                         {institutionData.institutionName} </p>

                                </div>
                                <div className="px-2 pt-4 flex justify-between items-center">
                                    <p className="InvSumContent"> Consuemr Number</p>
                                    <p className="InvSumContent"> {data.kuickpayID}</p>
                                </div>
                                <div className="px-2 pt-2 flex justify-between items-center">
                                    <p className="InvSumContent "> Name</p>
                                    <p className="InvSumContent "> {voucherData.consumer_Detail}</p>
                                </div>
                                <div className="px-2 pt-2 flex justify-between items-center">
                                    <p className="InvSumContent "> Due Date</p>
                                    <p className="InvSumContent "> {voucherData.due_Date} </p>
                                </div>
                                <div className="px-2 pt-2 flex justify-between items-center">
                                    <p className="InvSumContent "> Status</p>
                                    {/* <p className="InvSumContent "> {voucherData.bill_Status === "U" ? "Pending" : "Paid"}</p> */}<p
  className={` ${
    voucherData.bill_Status === "U" ? "text-red-500 text-sm font-medium " : "text-green-500 ext-sm ont-medium"
  }`}
>
  {voucherData.bill_Status === "U" ? "Pending" : "Paid"}
</p>

                                </div>

                                <div className="border-t mt-5"></div>

                                {/* Bill Amount */}
                                <div className="px-2 pt-5 flex justify-between items-center">
                                    <p className="text-lg "> Bill Amount</p>
                                    <p className="text-lg">{institutionData.amount_Currency} {voucherData.billAmount}</p>
                                </div>
                                <div className=" xsmsize:border-t mt-5"></div>
                              </div>

                         </div>
                    </div>
                </div>
                ) : (
                    
                    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 relative">
  
                    <div className="w-full py-3 md:w-6/12 order-2 md:order-1 animate-pulse">
                      <h2 className="ml-10 content tracking-widest text-xl lg:text-lg md:text-sm xsize:text-md h-2 bg-customPulseColor rounded w-40 mb-4"></h2>
                      <div className="xsize:mr-10">
                      
                        <div className="flex items-center mb-4">
                          <div className="cursor-pointer p-4 flex justify-between items-center">
                            <div className="content flex items-center">
                              <div className="w-20 h-8 bg-customPulseColor rounded"></div>
                              <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
                            </div>
                          </div>
                          <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
                        </div>
                      
                        <div className="border-t my-2"></div>

                        
                        <div className="flex items-center mb-4">
                          <div className="cursor-pointer p-4 flex justify-between items-center">
                            <div className="content flex items-center">
                              <div className="w-20 h-8 bg-customPulseColor rounded"></div>
                              <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
                            </div>
                          </div>
                          <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
                        </div>
                      

                        
                        <div className="border-t my-2"></div>
                        <div className="flex items-center mb-4">
                          <div className="cursor-pointer p-4 flex justify-between items-center">
                            <div className="content flex items-center">
                              <div className="w-20 h-8 bg-customPulseColor rounded"></div>
                              <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
                            </div>
                          </div>
                          <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
                        </div>
                      
                      </div>
                    </div>

                  
                    <div className="w-full max-h-80 md:w-6/12 order-1 md:order-2 mr-1 sm:mr-4 md:mr-8 lg:mr-6 flex justify-center animate-pulse">
                      <div className="px-4 py-3 rounded lg:border md:border xs:border-none border-gray-300 xsize:w-full sm:w-full lg:w-10/12">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="heading tracking-widest text-xl lg:text-lg md:text-sm xsize:text-md h-2 bg-customPulseColor rounded w-40 mb-4"></h2>
                          <button className="content border-bg-btnblue border-x border-y  px-3 py-1 w-auto text-xl lg:text-md md:text-sm xsize:text-xs hover:bg-btnBlue hover:text-white h-8 bg-customPulseColor rounded"></button>
                        </div>

                        <div className="border-t mt-5"></div>

                        <div className="px-2 pt-2 flex text-xl justify-center items-center">
                          <p className="xl:text-2xl lg:text-1xl md:text-lg sm:text-sm xs-text-xs h-2 bg-customPulseColor rounded w-40 mb-4"></p>
                        </div>
                        <div className="px-2 pt-4 flex justify-between items-center">
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                        </div>
                        <div className="px-2 pt-2 flex justify-between items-center">
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                        </div>
                        <div className="px-2 pt-2 flex justify-between items-center">
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                        </div>

                        <div className="border-t mt-5"></div>

                        
                        <div className="px-2 pt-5 flex justify-between items-center">
                          <p className="text-lg h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="text-lg h-2 bg-customPulseColor rounded w-32"></p>
                        </div>
                        <div className="xsmsize:border-t mt-5"></div>
                      </div>
                    </div>
                </div>

                  )} 
                      </div> ) : (
                    
                    <div>
                  {institutionData && voucherData ? (
                      <div className=' lg:flex sm:flex-none justify-center'>
                    <div className="flex justify-center max-h-200 md:w-[50%] sm:w-6/6   order-1 md:order-2 mr-1 sm:mr-4 md:mr-8 lg:mr-6 ">
                                                                                                
                    <div className="px-4 py-3  xsize:w-[100%] sm:w-full lg:w-[80%]  ">
                        <div className='px-4 py-3 shadow-custom-shadow rounded  xs:border-none  border-gray-300 xsize:w-full sm:w-full lg:w-12/12  '>                                
                        <div className="flex justify-between items-center ">
                            {/* <h2 className="heading tracking-widest text-xl lg:text-xl md:text-md xsize:text-md"> Invoice Summary</h2> */}
                           
                        </div>

                        {/* Main Content started */}
                        <div className="flex justify-center items-center">
                          <h2 className={`${voucherData.bill_Status === "P" ? "heading font-medium tracking-widest text-2xl lg:text-xl md:text-md xsize:text-md" : "font-medium text-red-400 tracking-widest text-2xl lg:text-xl md:text-md xsize:text-md"  }`}>
                            Attention!!
                          </h2>
                        </div>
                        <div className="border-t mt-2"></div>

                       
                        <div className="px-2  flex text-xl justify-center items-center pt-5 pb-5">
                        <p className="xl:text-2xl lg:text-2xl md:text-2xl  sm:text-1xl xs-text-xs">           
                        {institutionData.institutionName} </p>
                          </div>

                        <div className="px-2 pt-4 flex justify-between items-center">
                          <p className="InvSumContent">Consumer Number</p>
                          <p className="InvSumContentweight">{data.kuickpayID}</p>
                        </div>
                        <div className="px-2 pt-2 flex justify-between items-center">
                          <p className="InvSumContent">Status</p>
                         
                            {/* <p className="InvSumContent "> {voucherData.bill_Status === "U" ? "Pending" : "Paid"}</p> */}
                            <p
  className={`${
    voucherData.bill_Status === "U"
      ? "text-red-500 text-sm font-medium"
      : voucherData.bill_Status === "P"
      ? "text-green-700 text-sm font-medium"
      : voucherData.bill_Status === "B"
      ? "text-red-500 text-sm font-medium"
      : "text-red-700 text-sm font-medium"
  }`}
>
  {voucherData.bill_Status === "U"
    ? "Pending"
    : voucherData.bill_Status === "P"
    ? "Paid"
    : voucherData.bill_Status === "B"
    ? "Block/Expired"
    : "Invalid Invoice Number"}
</p>


                        </div>

                        <div className="border-t mt-5"></div>
                        {/* <p className={`${voucherData.bill_Status === "P" ? " bg-green-200 font-medium text-center py-2 ":" bg-red-300 font-medium text-center py-2" }`}>Attention!!</p> */}

                  <p  className={`${voucherData.bill_Status === "P" ? " bg-green-200 font-light text-center ":" bg-red-300 font-light text-center " }`}>
                  
                         {voucherData.bill_Status === "U"
                        ? "Pending"
                        : voucherData.bill_Status === "P"
                        ? "Your bill is already paid."
                        : voucherData.bill_Status === "B"
                        ? "The Invoice number has been expired. Please contact to the institution"
                        : "The invoice number is incorrect. Please try with the valid one."}
                      </p>

                        <div className=" xsmsize:border-t mt-5"> </div>
                        
                        <div className="flex items-center w-full py-2  pt-10 relative">
                          <button onClick={backtoHome}  className="button-styleReceipt  bg-white border"> Continue</button>                
                        </div>

                        <div className="flex items-center w-full py-2 pb-10 relative">
                          <button  className="button-styleReceipt-white bg-btnBlue"> Download Kuickpay App</button>                
                        </div>
                      </div>

                    </div>
                    </div>
                    </div>

                   ) :(
                    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 relative">
  
                    <div className="w-full py-3 md:w-6/12 order-2 md:order-1 animate-pulse">
                      <h2 className="ml-10 content tracking-widest text-xl lg:text-lg md:text-sm xsize:text-md h-2 bg-customPulseColor rounded w-40 mb-4"></h2>
                      <div className="xsize:mr-10">
                      
                        <div className="flex items-center mb-4">
                          <div className="cursor-pointer p-4 flex justify-between items-center">
                            <div className="content flex items-center">
                              <div className="w-20 h-8 bg-customPulseColor rounded"></div>
                              <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
                            </div>
                          </div>
                          <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
                        </div>
                       
                        <div className="border-t my-2"></div>
                  
                        
                        <div className="flex items-center mb-4">
                          <div className="cursor-pointer p-4 flex justify-between items-center">
                            <div className="content flex items-center">
                              <div className="w-20 h-8 bg-customPulseColor rounded"></div>
                              <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
                            </div>
                          </div>
                          <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
                        </div>
                       
                  
                        
                        <div className="border-t my-2"></div>
                        <div className="flex items-center mb-4">
                          <div className="cursor-pointer p-4 flex justify-between items-center">
                            <div className="content flex items-center">
                              <div className="w-20 h-8 bg-customPulseColor rounded"></div>
                              <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
                            </div>
                          </div>
                          <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
                        </div>
                       
                      </div>
                    </div>
                  
                   
                    <div className="w-full max-h-80 md:w-6/12 order-1 md:order-2 mr-1 sm:mr-4 md:mr-8 lg:mr-6 flex justify-center animate-pulse">
                      <div className="px-4 py-3 rounded lg:border md:border xs:border-none border-gray-300 xsize:w-full sm:w-full lg:w-10/12">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="heading tracking-widest text-xl lg:text-lg md:text-sm xsize:text-md h-2 bg-customPulseColor rounded w-40 mb-4"></h2>
                          <button className="content border-bg-btnblue border-x border-y  px-3 py-1 w-auto text-xl lg:text-md md:text-sm xsize:text-xs hover:bg-btnBlue hover:text-white h-8 bg-customPulseColor rounded"></button>
                        </div>
                  
                        <div className="border-t mt-5"></div>
                  
                        <div className="px-2 pt-2 flex text-xl justify-center items-center">
                          <p className="xl:text-2xl lg:text-1xl md:text-lg sm:text-sm xs-text-xs h-2 bg-customPulseColor rounded w-40 mb-4"></p>
                        </div>
                        <div className="px-2 pt-4 flex justify-between items-center">
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                        </div>
                        <div className="px-2 pt-2 flex justify-between items-center">
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                        </div>
                        <div className="px-2 pt-2 flex justify-between items-center">
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
                        </div>
                  
                        <div className="border-t mt-5"></div>
                  
                        
                        <div className="px-2 pt-5 flex justify-between items-center">
                          <p className="text-lg h-2 bg-customPulseColor rounded w-32"></p>
                          <p className="text-lg h-2 bg-customPulseColor rounded w-32"></p>
                        </div>
                        <div className="xsmsize:border-t mt-5"></div>
                      </div>
                    </div>
                  </div>
                   )}
                
                    </div>


                    )}

            </main>
            <Footer />
        </div>
    );
};

const aymentInitilizationWithSuspense = () => {
    return (
      <Suspense fallback={
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 relative">
  
  <div className="w-full py-3 md:w-6/12 order-2 md:order-1 animate-pulse">
    <h2 className="ml-10 content tracking-widest text-xl lg:text-lg md:text-sm xsize:text-md h-2 bg-customPulseColor rounded w-40 mb-4"></h2>
    <div className="xsize:mr-10">
    
      <div className="flex items-center mb-4">
        <div className="cursor-pointer p-4 flex justify-between items-center">
          <div className="content flex items-center">
            <div className="w-20 h-8 bg-customPulseColor rounded"></div>
            <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
          </div>
        </div>
        <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
      </div>
     
      <div className="border-t my-2"></div>

      
      <div className="flex items-center mb-4">
        <div className="cursor-pointer p-4 flex justify-between items-center">
          <div className="content flex items-center">
            <div className="w-20 h-8 bg-customPulseColor rounded"></div>
            <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
          </div>
        </div>
        <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
      </div>
     

      
      <div className="border-t my-2"></div>
      <div className="flex items-center mb-4">
        <div className="cursor-pointer p-4 flex justify-between items-center">
          <div className="content flex items-center">
            <div className="w-20 h-8 bg-customPulseColor rounded"></div>
            <span className="p-4 text-sm h-2 bg-customPulseColor rounded w-32"></span>
          </div>
        </div>
        <div className="content transform transition-transform ml-auto h-2 bg-customPulseColor rounded w-8"></div>
      </div>
     
    </div>
  </div>

 
  <div className="w-full max-h-80 md:w-6/12 order-1 md:order-2 mr-1 sm:mr-4 md:mr-8 lg:mr-6 flex justify-center animate-pulse">
    <div className="px-4 py-3 rounded lg:border md:border xs:border-none border-gray-300 xsize:w-full sm:w-full lg:w-10/12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="heading tracking-widest text-xl lg:text-lg md:text-sm xsize:text-md h-2 bg-customPulseColor rounded w-40 mb-4"></h2>
        <button className="content border-bg-btnblue border-x border-y  px-3 py-1 w-auto text-xl lg:text-md md:text-sm xsize:text-xs hover:bg-btnBlue hover:text-white h-8 bg-customPulseColor rounded"></button>
      </div>

      <div className="border-t mt-5"></div>

      <div className="px-2 pt-2 flex text-xl justify-center items-center">
        <p className="xl:text-2xl lg:text-1xl md:text-lg sm:text-sm xs-text-xs h-2 bg-customPulseColor rounded w-40 mb-4"></p>
      </div>
      <div className="px-2 pt-4 flex justify-between items-center">
        <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
        <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
      </div>
      <div className="px-2 pt-2 flex justify-between items-center">
        <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
        <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
      </div>
      <div className="px-2 pt-2 flex justify-between items-center">
        <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
        <p className="InvSumContent h-2 bg-customPulseColor rounded w-32"></p>
      </div>

      <div className="border-t mt-5"></div>

      
      <div className="px-2 pt-5 flex justify-between items-center">
        <p className="text-lg h-2 bg-customPulseColor rounded w-32"></p>
        <p className="text-lg h-2 bg-customPulseColor rounded w-32"></p>
      </div>
      <div className="xsmsize:border-t mt-5"></div>
    </div>
  </div>
</div>
        
        
        
        }>
        <PaymentInitilization />
      </Suspense>
    );
  };

export default aymentInitilizationWithSuspense;
