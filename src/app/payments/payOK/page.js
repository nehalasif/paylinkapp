'use client';

import React, { useEffect, useState,useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { decryptText } from '@/app/utils/decryptText';
import { createAxiosInstance } from '@/app/constants/axiosInstance';
import { API_URLS } from '@/app/constants/config';
import EncryptionUtils from "../../utils/encryptionUtils";
import Header from '@/app/components/header';
import logo from '../../components/Images/kuickpay-logo.png';
import Footer from '@/app/components/footer';
import html2canvas from 'html2canvas';



const  PayOK= () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [processedData, setProcessedData] = useState(null);
    const [statusCode, setStatusCode] = useState(false);
    const [id , setId] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); // Manage loading state
    const ID = searchParams.get('ID');
    const [data, setData] = useState(null);
    const { decryptData } = require('../../utils/decryptUtils');
    // const { Canvas } = useQRCode();
    const hiddenRef = useRef();
  
    const handleDownload = async () => {
      if (hiddenRef.current) {
        try {
          const canvas = await html2canvas(hiddenRef.current, {
            scale: 5, // Higher scale for better quality
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
  
   
  const currentDate = new Date();

  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  };
  
  // Pass the current datetime
  console.log(formatDate(currentDate));

	const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
	const day = String(currentDate.getDate()).padStart(2, '0');
	const year = currentDate.getFullYear();

	const hours = String(currentDate.getHours()).padStart(2, '0');
	const minutes = String(currentDate.getMinutes()).padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';

  const formattedDate = `${month}-${day}-${year} ${hours}:${minutes} ${ampm}`;


  const transactionPost = async () => {
            const searchParams = new URLSearchParams(location.search);
            // const searchParams = new URLSearchParams(window.location.search);
            const ID = searchParams.get('ID');
            const decodedID = decodeURIComponent(ID);
            const decryptedID = EncryptionUtils.decryptText(decodedID);
            
        const payload = {
            institutionID: sessionStorage.getItem('institutionID'),
            transactionID: sessionStorage.getItem('transactionID'),
            orderID: sessionStorage.getItem('orderID'),
            amount: sessionStorage.getItem('amount'),
            SecurityCode: sessionStorage.getItem('cardSecurityCode'),
            CardNumber: sessionStorage.getItem('cardNumber'),
            ExpiryMonth: sessionStorage.getItem('cardMonth'),
            ExpiryYear: sessionStorage.getItem('cardYear'),
            cnic: '',
            type: "Card",
            UserID: 'Guest',
            isEncrypt: true,

            
        }
        console.log(":Payload: ",payload);
        console.log(":Token: ",sessionStorage.getItem('token'));

      const checkoutAxios = createAxiosInstance({
            baseURL: API_URLS.gatewayUrl,
            token: sessionStorage.getItem('token'),
          });
        try {
          
          const res = await checkoutAxios.post('/api/Transaction', payload, {
            headers: {
              'Content-Type': 'application/json' // Ensuring the correct content type
               // Include token in Authorization header
            }
            
            });
            console.log("🚀 ~ transactionPost ~ res:", res.data)
            if (res.status === 200) {
                
                if (res.data.responseCode === '00') {
                    console.log("🚀 ~ transactionPost ~ res:", res.data)
                    console.log("🚀 ~ Is Loading",false)
                    setIsLoading(false);
                    setProcessedData(res.data);
                   
                    
                    // startTimer()
                    // sessionStorage.setItem('transactionPost', true);
                }
                else {
                  setIsLoading(false);
                  setProcessedData(res.data);
                  console.log("🚀 ~ transactionPost ~ res:", res.data)
                  
                    setFailureUrl(res.returnUrl);
                    setMessage(res.data.message);
                }
            }
            else {
             
                setMessage(`Your session has expired. Please try once more.`);
            }
            
        }
        catch (ex) {
            console.log(ex);
            setIsLoading(false);
            
        }
	}

  useEffect(() => {

    try{
      setIsLoading(true); 
      const databus =sessionStorage.getItem('dataBus');
      console.log("Startig >>>>");
      //console.log(databus);
      const GetDatafromInquiry = decryptData(sessionStorage.getItem('dataBus'));
      console.log(GetDatafromInquiry);
      if (GetDatafromInquiry) {
          setData({
            voucherData: GetDatafromInquiry.voucherData,
            institution: GetDatafromInquiry.Institution,
            kuickpayID: GetDatafromInquiry.kuickpayID,
          });
        }


        //console.log(data);
        transactionPost();    

        
      // if (ID) {
          
      //     const decodedID = decodeURIComponent(ID);
      //     const decryptedID = EncryptionUtils.decryptText(decodedID);
      //     const splitedArray = decryptedID.split(',');
      //     setProcessedData(splitedArray);
         
      // }
    }
  catch (error) {
    console.error('Error UseEffect Getdata from Databus:', error);
  }

    
   
}, []);

const backtoHome = async () =>{
  router.push('/');
 }

  return (


<div className="p-1 flex flex-col min-h-screen z-10">
    <Header Heading={"PAYMENT LINK"} logo={logo} width={200} height={50} />

    <main className="flex items-center justify-center pt-5 sm:ml-5 sm:mr-5">
      <div className="w-full max-h-100 md:w-5/12 xsize:w-10/12 order-1 md:order-2 mr-1 sm:mr-4 md:mr-8 lg:mr-6 flex justify-center">
        <div ref={hiddenRef} className="px-4 py-3 md:shadow-custom-shadow rounded lg:border:none md:border:none xs:border-none border-gray-300 xsize:w-full sm:w-full lg:w-10/12">
          {!isLoading && data ? (
            <>
              <div className="flex justify-center items-center">
                <h2 className="heading tracking-widest text-2xl lg:text-xl md:text-md xsize:text-md">
                  Successful!
                </h2>
              </div>
             
              <div className="border-t mt-2"></div>
              <div className='px-2 pt-2 flex text-sm justify-center items-center'>
              <p>Your bill has been paid</p>
              </div>
              
              <div className="px-2 pt-2 flex text-xl justify-center items-center">
             <p className="xl:text-2xl lg:text-2xl md:text-2xl font-normal  sm:text-1xl xs-text-xs">           
                 PKR {data.voucherData.billAmount}0  </p>
                 </div>

                 <div className="px-2 pt-2 flex text-sm justify-center items-center">
             <p className="xl:text-sm lg:text-sm md:text-sm  sm:text-1xl xs-text-xs">           
                 to </p>
                 </div>
              <div className="px-2 pt-2 flex text-xl justify-center items-center">
             <p className="xl:text-2xl lg:text-2xl md:text-2xl  sm:text-1xl xs-text-xs">           
                  {data.institution.institutionName} </p>
                 </div>
                 <br></br>
              <div className="px-2 pt-4 flex justify-between items-center">
                <p className="InvSumContent">Consumer Number</p>
                <p className="InvSumContentweight">{data.kuickpayID}</p>
              </div>
              <div className="px-2 pt-2 flex justify-between items-center">
                <p className="InvSumContent">Consumer Details</p>
                <p className="InvSumContentweight">{data.voucherData.consumer_Detail} </p>
              </div>
              <div className="px-2 pt-2 flex justify-between items-center">
                <p className="InvSumContent">Payment Date</p>
                <p className="InvSumContentweight">{formatDate(currentDate)} </p>
              </div>

              {/* <div className="border-t mt-5"></div>
              <p className="px-2 pt-2 justify-between items-center lg:text-md md:text-md sm:text-sm xsize:text-xs">
                Your Platform Fee is Rs. for using a Visa Card
              </p> */}

              {/* <div className="px-2 pt-5 flex justify-between items-center">
                <p className="text-lg font-light">Payable Amount</p>
                <p className="font-medium text-lg">PKR </p>
              </div> */}

              <div className="flex items-center w-full py-2 mt-10 relative">
                <button onClick={backtoHome}  className="button-styleReceipt-white  bg-btnBlue"> Close</button>                
              </div>

              <div className="flex items-center w-full py-2 relative">
                <button  onClick={handleDownload}  className="button-styleReceipt  bg-white border"> Save & Share</button>                
              </div>

              <div className="flex items-center w-full py-2 relative">
                <button  className="button-styleReceipt-white bg-btnBlue"> Download Kuickpay App</button>                
              </div>
            </>
          ) : (
            <div>
              {/* Page load skeleton here */}
              <>
  {/* Heading */}
  <div className="flex justify-center items-center animate-pulse">
    <div className="bg-gray-300 rounded w-48 h-6"></div>
  </div>

  {/* Border */}
  <div className="border-t mt-2"></div>

  {/* Subtext */}
  <div className="px-2 pt-2 flex text-sm justify-center items-center animate-pulse">
    <div className="bg-gray-300 rounded w-40 h-4"></div>
  </div>

  {/* Bill Amount */}
  <div className="px-2 pt-2 flex text-xl justify-center items-center animate-pulse">
    <div className="bg-gray-300 rounded w-36 h-6"></div>
  </div>

  {/* "To" Text */}
  <div className="px-2 pt-2 flex text-sm justify-center items-center animate-pulse">
    <div className="bg-gray-300 rounded w-12 h-4"></div>
  </div>

  {/* Institution Name */}
  <div className="px-2 pt-2 flex text-xl justify-center items-center animate-pulse">
    <div className="bg-gray-300 rounded w-44 h-6"></div>
  </div>

  <br />

  {/* Consumer Number */}
  <div className="px-2 pt-4 flex justify-between items-center animate-pulse">
    <div className="bg-gray-300 rounded w-32 h-4"></div>
    <div className="bg-gray-300 rounded w-28 h-4"></div>
  </div>

  {/* Consumer Details */}
  <div className="px-2 pt-2 flex justify-between items-center animate-pulse">
    <div className="bg-gray-300 rounded w-32 h-4"></div>
    <div className="bg-gray-300 rounded w-36 h-4"></div>
  </div>

  {/* Payment Date */}
  <div className="px-2 pt-2 flex justify-between items-center animate-pulse">
    <div className="bg-gray-300 rounded w-32 h-4"></div>
    <div className="bg-gray-300 rounded w-36 h-4"></div>
  </div>

  {/* Close Button */}
  <div className="flex items-center w-full py-2 mt-10 relative animate-pulse">
    <div className="bg-gray-300 rounded w-24 h-8"></div>
  </div>

  {/* Save & Share Button */}
  <div className="flex items-center w-full py-2 relative animate-pulse">
    <div className="bg-gray-300 rounded w-32 h-8"></div>
  </div>

  {/* Download App Button */}
  <div className="flex items-center w-full py-2 relative animate-pulse">
    <div className="bg-gray-300 rounded w-44 h-8"></div>
  </div>
</>

            </div>
          )}
        </div>
      </div>
    </main>

    <Footer />
  </div>

    // <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    //   {isLoading ? (
    //     // Tailwind Spinner
    //     <div className="flex items-center justify-center">
    //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
    //              <div 
    //                role="status"
    //                className="flex items-center justify-center"
    //              >
    //                <svg
    //                  aria-hidden="true"
    //                  className="w-24 h- text-gray-200 animate-spin dark:text-gray-600 fill-btnBlue"
    //                  viewBox="0 0 100 101"
    //                  fill="none"
    //                  xmlns="http://www.w3.org/2000/svg"
    //                >
    //                  <path
    //                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
    //                    fill="currentColor"
    //                  />
    //                  <path
    //                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
    //                    fill="currentFill"
    //                  />
    //                </svg>
    //                <span className="sr-only">Loading...</span>
    //              </div>
    //            </div>
                      
    //     </div>
    //   ) : (
    //     <div>
    //       <h1 className="text-2xl font-bold mb-4">Fetched Data:</h1>
    //       <pre className="bg-white p-4 rounded shadow">{JSON.stringify(processedData, null, 2)}</pre>
    //     </div>
    //   )}
    // </div>
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
        <PayOK />
      </Suspense>
    );
  };

export default aymentInitilizationWithSuspense;
