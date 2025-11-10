'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createAxiosInstance } from './constants/axiosInstance';
import Header from './components/header';
import Footer from './components/footer';
import SearchableTextbox from './components/SearchableTextbox';
import Textbox from './components/textbox';
import InfoArea from './components/InfoArea';
import SearchIcon from './components/svgs/cardinfo/search.svg';
import './globals.css';
import logo from './components/Images/kuickpay-logo.png';
import { API_URLS } from './constants/config';
import EncryptionUtils from "./utils/encryptionUtils";

const PaymentLink = () => {
  const [options, setOptions] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [kuickpayID, setKuickpayID] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  // --- 1. ADD LOADING STATE ---
  const [isLoadingBillers, setIsLoadingBillers] = useState(true);

  useEffect(() => {
    // ... (fetchAuthToken code remains the same)
    const AppAxios = createAxiosInstance({
      baseURL: API_URLS.appUrl,
      token: '',
    });

    const fetchAuthToken = async () => {
      try {
        const response = await AppAxios('/api/PublicLogin?Publickey=EDTmqKo05ULepDN29RpTnlAcpBOYP8dZ4gZac3ioqCs=');
        if (response.data.response_Code === '00') {
          setAuthToken(response.data.auth_token);
          sessionStorage.setItem('authToken', response.data.auth_token);
        } else {
          console.error('Failed to fetch auth token:', response.data);
          setIsLoadingBillers(false); // Stop loading if auth fails
        }
      } catch (error) {
        console.error('Error fetching auth token:', error);
        setIsLoadingBillers(false); // Stop loading if auth fails
      }
    };
    fetchAuthToken();
  }, []);

  // --- 2. UPDATE USEEFFECT TO MANAGE LOADING STATE ---
  useEffect(() => {
    if (!authToken) return;

    const AppAxios = createAxiosInstance({
      baseURL: API_URLS.appUrl,
      token: authToken,
    });

    const fetchInstitutionList = async () => {
      try {
        const response = await AppAxios.get('/api/Category/92', {
          headers: {
            username: '4caF+legIs/74we5bW5SRQ==',
            password: 'fb98UVJ8UrIi2NNGs2u9uw==',
          },
        });
        if (response.data.success) {
          const institutions = response.data.category.flatMap((cat) =>
            cat.biller.map((biller) => ({
              institutionName: biller.institutionName,
              institutionID: biller.institutionID,
            }))
          );
          setOptions(institutions);
        }
      } catch (error) {
        console.error('Error fetching institution list:', error);
      } finally {
        // This will run regardless of success or failure
        setIsLoadingBillers(false);
      }
    };

    fetchInstitutionList();
  }, [authToken]);

  // ... (handleSelect, CustomAlert, etc. remain the same)
  const handleSelect = (option) => {
    setSearchText(option.institutionName);
    setSelectedInstitution(option);
  };

  const CustomAlert = ({ message, onClose }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
        <div className="bg-white rounded-lg shadow-2xl text-center p-8 w-[350px] animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-4 border-[#287dce] rounded-full flex items-center justify-center">
              <span className="text-[#287dce] text-4xl font-bold">×</span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops...</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="bg-[#287dce] text-white font-semibold px-6 py-2 rounded-lg transition"
           
          >
            OK
          </button>
        </div>
      </div>
    );
  };
  
  const showCenteredToast = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // ===== Fetch Bill =====
  const handleFetchBill = () => {
    if (!selectedInstitution || !kuickpayID) {
      showCenteredToast('Please select an institution and enter Kuickpay ID.');
      return;
    }

    if (kuickpayID.length <= 5) {
      showCenteredToast('Kuickpay ID must be longer than 5 characters.');
      return;
    }

    const consumerDataEnc = EncryptionUtils.encryptText(
      JSON.stringify({
        institutionID: selectedInstitution.institutionID,
        kuickpayID: kuickpayID,
      })
    );
    router.push(`/pages/inquiry?data=${encodeURIComponent(consumerDataEnc)}`);
  };

  return (
    <div className="p-1 flex flex-col min-h-screen z-10 relative">
      {showAlert && <CustomAlert message={alertMessage} onClose={handleCloseAlert} />}

      <Header Heading={"PAYMENT LINK"} height={50} width={210} logo={logo} />

      <main className="flex items-center justify-center pt-5 sm:ml-5 sm:mr-5">
        <div className="lg:w-5/12 py-3 ml-5 mr-5 sm:p-2 sm:py-2 sm:ml-5 sm:mr-5 md:p-4 md:py-4 lg:p-5 lg:py-5">
          
          <div className="mb-4 relative">
            <label htmlFor="biller-search" className="block text-gray-600 mb-1">
              <p className="content">Search Your Biller</p>
            </label>
            {/* --- 3. PASS THE NEW PROPS --- */}
            <SearchableTextbox
              id="biller-search"
              placeholder="Search for a biller..."
              options={options
                .filter((o) =>
                  o.institutionName.toLowerCase().includes(searchText.toLowerCase())
                )
                .map((o) => o.institutionName)}
              searchText={searchText}
              Icon={SearchIcon}
              setSearchText={setSearchText}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              onSelect={(selectedName) => {
                const institution = options.find(
                  (opt) => opt.institutionName === selectedName
                );
                if (institution) handleSelect(institution);
              }}
              // Add these two new props
              isLoading={isLoadingBillers}
              disabled={isLoadingBillers}
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="consumer-number" className="block text-gray-600 mb-1">
              <p className="content">Enter Consumer Number</p>
            </label>
            <Textbox
              id="consumer-number"
              Icon={SearchIcon}
              placeholder="Enter Kuickpay ID"
              value={kuickpayID}
              onChange={(e) => setKuickpayID(e.target.value)}
            />
          </div>

          <InfoArea Text="Search Kuickpay ID or Consumer ID Number on your Bill/Invoice" />

          <div className="flex  items-center w-full py-2 mt-10">
            <button className=" hover:bg-white hover:border  border-blue-600 hover:text-blue-600 hover:zoom-in button-style" onClick={handleFetchBill}>
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