'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createAxiosInstance } from './constants/axiosInstance';
import Footer from './components/footer';
import SearchableTextbox from './components/SearchableTextbox';
import Textbox from './components/textbox';
import SearchIcon from './components/svgs/cardinfo/search.svg';
import logo from './components/Images/kuickpay-logo.png';
import { API_URLS } from './constants/config';
import EncryptionUtils from "./utils/encryptionUtils";
import './globals.css';

const PaymentLink = () => {
    const router = useRouter();
    const [options, setOptions] = useState([]);
    const [authToken, setAuthToken] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [kuickpayID, setKuickpayID] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState(null);
    
    // --- NEW STATE FOR BUTTON LOADER ---
    const [isLoading, setIsLoading] = useState(false);
    
    const dropdownRef = useRef(null);
    const [isFetchingBillers, setIsFetchingBillers] = useState(true);

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
                    setIsFetchingBillers(false);
                }
            } catch (error) {
                console.error('Error fetching auth token:', error);
                setIsFetchingBillers(false);
            }
        };
        fetchAuthToken();
    }, []);

    useEffect(() => {
        if (!authToken) return;

        setIsFetchingBillers(true);

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
                setIsFetchingBillers(false);
            }
        };
        fetchInstitutionList();
    }, [authToken]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleSelect = (option) => {
        setSearchText(option.institutionName);
        setSelectedInstitution(option);
    };

    // --- UPDATED FUNCTION TO HANDLE LOADING ---
    const handleFetchBill = () => {
        if (selectedInstitution && kuickpayID) {
            if (kuickpayID.length > 5) {
                // 1. Activate Loader
                setIsLoading(true);

                try {
                    const consumerDataEnc = EncryptionUtils.encryptText(JSON.stringify({
                        institutionID: selectedInstitution.institutionID,
                        kuickpayID: kuickpayID
                    }));
                    
                    // 2. Navigate
                    router.push(`/inquiry?data=${encodeURIComponent(consumerDataEnc)}`);
                    
                    // Note: We do NOT set isLoading(false) here because the page is changing.
                } catch (error) {
                    console.error("Error processing request:", error);
                    setIsLoading(false); // Stop loader if code crashes
                }

            } else {
                alert('The length of the Kuickpay ID must be greater than 5.');
            }
        } else {
            alert('Please select an institution and enter Kuickpay ID');
        }
    };

    return (
        <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden font-sans relative">
            
            {/* ================= BACKGROUND IMAGE FIX ================= */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={"/background.jpg"}
                    alt="Background"
                    fill
                    priority
                    quality={100} 
                    className="object-cover brightness-100" 
                />
             
                <div className="absolute inset-0 bg-black/5"></div>
            </div>

            <main className="flex-grow flex items-center justify-center p-4 pt-10 md:p-6 md:pt-12 relative z-10">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* ======================= LEFT SIDE ======================= */}
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl font-extrabold select-none">
                            <span className="text-[#00A651]">K</span>
                            <span className="text-[#287DCE]">P</span>
                        </div>

                        <div className="space-y-2">
                            <div className="w-48 mb-3">
                                <Image src={logo} alt="Kuickpay Logo" width={200} height={50} className="object-contain" />
                            </div>
                            <h2 className="text-2xl md:text-3xl text-slate-800 font-medium"> 
                                Your Trusted Payment Partner
                            </h2>
                            <p className="text-slate-700 italic text-md font-semibold"> 
                                "Pay Bills. Stay Chill. We've Got You Covered!"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/40 backdrop-blur-3xl p-5 rounded-2xl shadow-lg border border-white/50 flex flex-col items-start gap-2 transition-shadow">
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Instant Payment</h3>
                                    <p className="text-sm text-slate-600">Lightning fast transactions</p>
                                </div>
                            </div>

                            <div className="bg-white/40 backdrop-blur-3xl p-5 rounded-2xl shadow-lg border border-white/50 flex flex-col items-start gap-2 transition-shadow">
                                <div className="p-3 bg-green-50 rounded-full text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Secure & Safe</h3>
                                    <p className="text-sm mb-2 text-slate-600">Bank-level encryption</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-3 flex items-center gap-3 shadow-lg">
                            <div className="text-yellow-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8Zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4Z" fillOpacity="0" />
                                    <path fillRule="evenodd" d="M9 2.22a.75.75 0 0 1 1-.22A6 6 0 0 0 12 8a.75.75 0 0 1 0 1.5c-4.97 0-9-3.348-9-7.5.001-.086.004-.171.01-.256a.75.75 0 0 1 .99.256ZM3.75 12a8.25 8.25 0 0 0 16.5 0v.139c-.066 3.32-2.126 6.13-5.228 7.378a.75.75 0 0 1-.544-1.396C16.89 17.156 18.25 14.971 18.25 12.14v-.14a6.75 6.75 0 0 0-13.5 0v.139c0 2.83 1.36 5.016 3.772 5.981a.75.75 0 0 1-.544 1.396C4.876 18.27 2.816 15.46 2.75 12.14V12Zm9 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-slate-700 italic text-md font-medium">"Paying bills has never been this easy and secure"</p>
                        </div>
                    </div>

                    {/* ======================= RIGHT SIDE ======================= */}
                    <div className="bg-white/50 backdrop-blur-3xl rounded-2xl shadow-xl p-6 md:p-8 border border-white/50 h-fit">

                        <div className="mb-4">
                            <h1 className="text-3xl font-outfit text-slate-800">Pay Your Bill</h1>
                            <p className="text-slate-700 mt-1 text-sm">Enter your details to view and pay your bill instantly</p>
                        </div>

                        <hr className="border-slate-400/30 mb-6" />

                        <div className="space-y-4">
                            <div className="space-y-1" >
                                <div className="flex justify-between items-center">
                                    <label className="block font-outfit text-slate-700">Select Billers</label>
                                    {isFetchingBillers && (
                                        <span className="text-xs text-[#287DCE] flex items-center gap-1">
                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading Billers...
                                        </span>
                                    )}
                                </div>
                                <div 
                                    ref={dropdownRef} 
                                    className={`bg-gray-100 rounded-lg border border-white/50 focus-within:border-btnBlue focus-within:bg-white transition-all ${isFetchingBillers ? 'opacity-70 pointer-events-none' : ''}`}
                                >
                                    <SearchableTextbox
                                        options={options
                                            .filter(option => option.institutionName.toLowerCase().includes(searchText.toLowerCase()))
                                            .map(option => option.institutionName)
                                        }
                                        searchText={searchText}
                                        setSearchText={setSearchText}
                                        isOpen={isOpen}
                                        setIsOpen={setIsOpen}
                                        onSelect={(selectedName) => {
                                            const institution = options.find(opt => opt.institutionName === selectedName);
                                            if (institution) handleSelect(institution);
                                            setIsOpen(false);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-outfit text-slate-700">Consumer Number</label>
                                <div className="bg-gray-100 rounded-lg border border-white/50 focus-within:border-btnBlue focus-within:bg-white transition-all">
                                    <Textbox
                                        Icon={SearchIcon}
                                        placeholder="Enter your consumer number"
                                        value={kuickpayID}
                                        onChange={(e) => setKuickpayID(e.target.value)}
                                        className="bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* --- UPDATED BUTTON WITH LOADING STATE --- */}
                            <button
                                onClick={handleFetchBill}
                                disabled={isLoading}
                                className={`w-full bg-[#287DCE] text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-2 ${
                                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Fetch Bill</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-400/30 flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-800">
                                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                </svg>
                                <span className="text-md font-medium text-slate-700">Secured by 256-bit SSL encryption</span>
                            </div>
                            <span className="text-sm text-slate-500">Trusted by over 100,000+ users</span>
                        </div>
                    </div>
                </div>
            </main>

            <div className="relative z-10">
            </div>
        </div>
    );
};

export default PaymentLink;