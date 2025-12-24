'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'; 
import Header from '../components/header';
import Footer from '../components/footer';
import logo from '../components/Images/kuickpay-logo.png';

const ProcessHTML = () => {
  const router = useRouter();
  const formContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loader state add kiya

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Get Data directly
      const storedContent = sessionStorage.getItem('htmlContent');
      
      if (!storedContent) {
        console.error("No content found in sessionStorage");
        setIsLoading(false);
        return; 
      }

      setHtmlContent(storedContent);

      // 2. Logic check karo (Local variable 'storedContent' use karein, state nahi)
      const isUrl = storedContent.startsWith("http://") || storedContent.startsWith("https://");

      if (isUrl) {
        setIframeUrl(storedContent);
        setIsLoading(false);
      } else {
        // 3. Agar HTML hai (Bank Redirect Form), to document write karein
        // Timeout thoda kam kiya taake user ko wait na karna pare
        setTimeout(() => {
          const newWindow = window.open("", "_self");
          if (newWindow && newWindow.document) {
            newWindow.document.open();
            newWindow.document.write(storedContent);
            newWindow.document.close();
          }
          setIsLoading(false);
        }, 500);
      }
    }
  }, []); // Dependency array empty rakhein

  const handleIframeLoaded = (e) => {
    if (iframeRef.current) {
      try {
        const currentUrl = iframeRef.current.contentWindow.location.href;
        // console.log("Current URL:", currentUrl);
        // ... baki logic same
      } catch (error) {
        console.error("Error accessing iframe content:", error);
      }
    }
  };

  return (
    <div className="p-1 flex flex-col min-h-screen z-10 bg-[#F3F7FA]">
      <Header Heading={'Processing Payment'} logo={logo} width={200} height={60} />
      
      <main className="flex flex-col items-center justify-center flex-grow pt-5 px-5 sm:ml-5 sm:mr-5">
        
        {/* Loader dikhayen jab tak decision na ho jaye */}
        {isLoading ? (
           <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 font-medium">Redirecting to Bank...</p>
           </div>
        ) : iframeUrl ? (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            title="Embedded Content"
            style={{ height: "80vh", width: "100%", border: "none" }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onLoad={handleIframeLoaded}
          />
        ) : (
          /* Fallback agar document.write fail ho jaye */
          <div
            ref={formContainerRef}
            className="w-full text-center"
          >
             <p className="text-gray-500">Processing...</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProcessHTML;