'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import axiosInstance, { createAxiosInstance } from './constants/axiosInstance'; 
import Header from './components/header';
import Footer from './components/footer';
import SearchableTextbox from './components/SearchableTextbox';
import Textbox from './components/textbox';
import InfoArea from './components/InfoArea';
import SearchIcon from './components/svgs/cardinfo/search.svg';
import CryptoJS from 'crypto-js';
import './globals.css';
import logo from './components/Images/kuickpay-logo.png';
import { API_URLS } from './constants/config';
import EncryptionUtils from "./utils/encryptionUtils";



const PaymentLink = () => {
  const [expanded, setExpanded] = useState(null); 
  const [options, setOptions] = useState([]); 
  const [authToken, setAuthToken] = useState(null); 
  const [searchText, setSearchText] = useState(''); 
  const [isOpen, setIsOpen] = useState(false); 
  const [kuickpayID, setKuickpayID] = useState(''); // State for Kuickpay ID
  const [selectedInstitution, setSelectedInstitution] = useState(null); // Store selected institution
 const router = useRouter();
 const { encryptData } = require('./utils/encrypText');
 const { decryptData } = require('./utils/decryptUtils');
  // Fetch Authentication Token
  useEffect(() => {

     const AppAxios = createAxiosInstance({
            baseURL: API_URLS.appUrl,
            token: '',
          });
    

    const fetchAuthToken = async () => {
      try {
          const response = await AppAxios(
          '/api/PublicLogin?Publickey=EDTmqKo05ULepDN29RpTnlAcpBOYP8dZ4gZac3ioqCs='
        );
        if (response.data.response_Code === '00') {
          setAuthToken(response.data.auth_token);
          sessionStorage.setItem('authToken', response.data.auth_token);
        } else {
          console.error('Failed to fetch auth token:', response.data);
        }
      } catch (error) {
        console.error('Error fetching auth token:', error);
      }
    };
    fetchAuthToken();
  }, []);

  // Fetch Institution List
  useEffect(() => {
    if (!authToken) return;

    const AppAxios = createAxiosInstance({
      baseURL: API_URLS.appUrl,
      token: authToken,
    });

    const fetchInstitutionList = async () => {
      try {
        const response = await AppAxios.get('/api/Category/92',{
            headers: {
              
              username: '4caF+legIs/74we5bW5SRQ==',
              password: 'fb98UVJ8UrIi2NNGs2u9uw==',
            },
          }
        );

        if (response.data.success) {
          const institutions = response.data.category.flatMap((cat) =>
            cat.biller.map((biller) => ({
              institutionName: biller.institutionName,
              institutionID: biller.institutionID,
            }))
          );
          setOptions(institutions); 
        } else {
          //console.error('Failed to fetch institution list:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching institution list:', error);
      }
    };
    fetchInstitutionList();
  }, [authToken]);

  // Handle option selection
  const handleSelect = (option) => {
    setSearchText(option.institutionName); 
    setSelectedInstitution(option); // Store selected institution
   // console.log('Selected institution:', option); 
  };

  const handleFetchBill = () => {
    
    
    
    if (selectedInstitution && kuickpayID) {
      if (kuickpayID.length > 5) {
          // Encrypt the data securely
          const consumerDataEnc = EncryptionUtils.encryptText(JSON.stringify({
            institutionID: selectedInstitution.institutionID,
            kuickpayID: kuickpayID
        }))
          router.push(`pages/inquiry?data=${encodeURIComponent(consumerDataEnc)}`);
      } else {
          alert('The length of the Kuickpay ID must be greater than 5.');
      }
  } else {
      alert('Please select an institution and enter Kuickpay ID');
  }
  
};
  
  

  return (
    <div className="p-1 flex flex-col min-h-screen z-10">
      <Header Heading={"PAYMENT LINK"} height={50} width={210}  logo={logo}  />

      <main className="flex items-center justify-center pt-5 sm:ml-5 sm:mr-5">
        <div className="lg:w-5/12 py-3 ml-5 mr-5 sm:p-2 sm:py-2 sm:ml-5 sm:mr-5 md:p-4 md:py-4 lg:p-5 lg:py-5">
         

          <div className="mb-4 relative">
          <label htmlFor="card-number" className="block text-gray-600 mb-1">
          <p className="content">Search Your Biller</p>
              </label>
              <div className="relative">
                
          <SearchableTextbox
              placeholder="Search for a biller..."
              options={options
                .filter(option => option.institutionName.toLowerCase().includes(searchText.toLowerCase()))
                .map(option => option.institutionName) 
              }
              searchText={searchText}
              setSearchText={setSearchText}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              onSelect={(selectedName) => {
                //console.log('Selected name:', selectedName); // Debug log
                const institution = options.find(opt => opt.institutionName === selectedName);
                if (institution) {
                  //console.log('Found institution:', institution); // Debug log
                  handleSelect(institution);
                } else {
                 //console.error('Institution not found in options.');
                }
              }}
            />
            </div>
          </div>

          <div className="flex items-center px-2 py-4">
           
          </div>
          <div className="mb-4 relative">
          <label htmlFor="card-number" className="block text-gray-600 mb-1">
          <p className="content">Enter Consumer Number</p>
              </label>
              <div className="relative">
                
              <Textbox
                  Icon={SearchIcon}
                  placeholder="Enter Kuickpay ID"
                  value={kuickpayID} // Bind the state
                  onChange={(e) => {
                    //console.log('Kuickpay ID input value:', e.target.value); // Debug log
                    setKuickpayID(e.target.value); // Update state
                  }}
                />

              </div>
          </div>
          {/* Kuickpay ID Input */}
         


          <InfoArea Text="Search Kuickpay ID or Consumer ID Number on your Bill/Invoice" />

          <div className="flex items-center  w-full py-2 mt-10">
            <button className="button-style" onClick={handleFetchBill}>
              Fetch Bill
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentLink;
