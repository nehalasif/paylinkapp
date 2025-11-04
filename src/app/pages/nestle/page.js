'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For navigation
import Header from '../components/header';
import Footer from '../components/footer';
import logo from '../components/Images/nestlelogo.avif';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const PaymentForm = () => {
  const router = useRouter();

  const [customerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);  // Initially null
  const InstitutionID = "00008";
  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const response = await axios.get(
          'https://testcoreweb.kuickpay.com/api/PublicLogin?Publickey=EDTmqKo05ULepDN29RpTnlAcpBOYP8dZ4gZac3ioqCs='
        );
        if (response.data.response_Code === '00'  ) {
          setAuthToken(response.data.auth_token);
        } else {
          console.error('Failed to fetch auth token:', response.data);
        }
      } catch (error) {
        console.error('Error fetching auth token:', error);
      }
    };
    fetchAuthToken();
  }, []);

  const handleFetchDetails = async () => {
    try {
      setIsLoading(true);
       // Fetch has been attempted
      
      const apiUrl = `https://uat-paymentlink.kuickpay.com/api/GetCPMPayers/${customerID}/${InstitutionID}`;
  
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (response.data.response_Code === "00" && response.data.response.ID >0 ) {
        const CustomerResponse = response.data.response;
        setCustomerData(CustomerResponse);
        console.log('Customer Data:', CustomerResponse);
      } else {
        setCustomerData(null); // Set to null when API call fails
        
        
      }
    } catch (error) {
      setCustomerData(null);
      console.error('Error fetching details:', error.message);

    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  const handleGeneratePayment = async () => {
    if (!customerData || !amount) {
      console.error("Missing customer details or amount");
      return;
    }
  
    try {
      setIsLoading(true);
  
      // Generate dates
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 2); // Two days from today
  
      const issueDate = today.toISOString().split("T")[0];
      const expiryDate = dueDate.toISOString().split("T")[0];
  
      // API Payload
      const payload = {
        institutionID: InstitutionID, // Hardcoded
        registrationNumber: customerID, // Taken from entered Customer ID
        head1: "Fee",
        amount1: parseInt(amount),
        head2: "",
        amount2: 0,
        head3: "",
        amount3: 0,
        head4: "",
        amount4: 0,
        head5: "",
        amount5: 0,
        head6: "",
        amount6: 0,
        head7: "",
        amount7: 0,
        head8: "",
        amount8: 0,
        head9: "",
        amount9: 0,
        head10: "",
        amount10: 0,
        totalAmount: parseInt(amount),
        dueDate: dueDate.toISOString().split("T")[0], // Due date in YYYY-MM-DD
        amountAfterDueDate: parseInt(amount),
        expiryDate: expiryDate,
        issueDate: issueDate,
        voucherMonth: `${today.getMonth() + 1}`.padStart(2, "0"), // Current month
        voucherYear: today.getFullYear(), // Current year
        name: customerData.Name || "",
        mobile: customerData.Mobile || "",
        email: customerData.Email || "",
        branch: "khi", // Hardcoded branch
      };
  
      console.log("Payload:", payload); // Debugging payload
  
      const response = await axios.post(
        "https://uat-paymentlink.kuickpay.com/api/InsertVoucher",
        payload,
        {
          headers: {
            username: "GIyVyXsqiH9TrDyTB56Lvw==",
            password: "0yBlpatAu8BGeBnRL+5nlQ==",
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data && response.data.response_Code === "00") {
        //console.log("Payment Generated Successfully:","InsID"+InstitutionID +" " + response.data.response_Vouchernumber +"AuthToken " +authToken);

        const encryptedData = CryptoJS.AES.encrypt(
          JSON.stringify({
              institutionID: InstitutionID,
              kuickpayID: response.data.response_Vouchernumber,
              authToken: authToken
          }),
          '2FBC1A0D4B62EABEC9D6E35A9F0D47E967DDBF4A1EC98AC9A711EEB91856B6D4'  //'your-secret-key'  //process.env.SECRET_KEY // Use an environment variable for the secret key in production
      ).toString();

      router.push(`/inquiry?data=${encodeURIComponent(encryptedData)}`);


        //router.push("/Inquiry"); // Navigate to Inquiry page
      } else {
        console.error("Failed to generate payment:", response.data);
      }
    } catch (error) {
      console.error("Error generating payment:", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-1 flex flex-col min-h-screen z-10">
      <Header Heading={'Nestlé Pure Life - Payments'} logo={logo} width={60} height={60} />
      

      <main className="flex flex-col items-center justify-center pt-5 px-5 sm:ml-5 sm:mr-5">
        {/* Customer ID Input and Fetch Button */}
        <div className="w-full max-w-md p-4 bg-white shadow-md rounded-md">
          <label htmlFor="customerID" className="block mb-2 font-medium">
            Customer ID
          </label>
          <div className="flex items-center">
            <input
              id="customerID"
              type="text"
              placeholder="Enter Customer ID"
              value={customerID}
              onChange={(e) => setCustomerID(e.target.value)}
              className="flex-grow border rounded p-2 mr-2"
            />
            <button
              onClick={handleFetchDetails}
              className="xsize:text-xs bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600"
            >
              {isLoading ? 'Fetching...' : 'Fetch Details'}
            </button>
          </div>

          {/* Display Customer Information */}
          {hasFetched &&  (
                      customerData ? (

                        
                        <div className="mt-4 p-2 bg-gray-100 rounded">
                          <p className="text-sm font-medium">Customer Information:</p>
                          <div className="px-2 pt-4 flex justify-between items-center">
                          <p className="InvSumContent">Name:</p>
                          <p className="InvSumContentweight">{customerData.Name || 'N/A'}</p>
                        </div>
                        <div className="px-2 pt-2 flex justify-between items-center">
                      <p className="InvSumContent">Mobile:</p>
                      <p className="InvSumContentweight">{customerData.Mobile || 'N/A'}</p>
                    </div>

                    <div className="px-2 pt-2 flex justify-between items-center">
                      <p className="InvSumContent">Email:</p>
                      <p className="InvSumContentweight">{customerData.Email || 'N/A'}</p>
                    </div>
                        </div>
                      ) : (
                  <div className="mt-4 p-2 bg-red-100 rounded">
                    <p className="text-sm font-medium text-red-600">
                      Customer Details not found
                    </p>
                  </div>
                )
              )}
        </div>

        {/* Enter Amount Section (Hidden Initially) */}
        {customerData && (
          <div className="w-full max-w-md p-4 mt-6 bg-white shadow-md rounded-md">
            <label htmlFor="amount" className="block mb-2 font-medium">
              Enter Amount
            </label>
            <input
              id="amount"
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />
            <button
              onClick={handleGeneratePayment}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {isLoading ? 'Processing...' : 'Generate Payment'}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PaymentForm;
