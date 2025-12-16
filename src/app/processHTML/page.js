'use client';

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'; // For navigation
import Header from '../components/header';
import Footer from '../components/footer';
import logo from '../components/Images/kuickpay-logo.png';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const ProcessHTML = () => {
    const router = useRouter();
  const formContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [content, setHtmlContent] = useState(null);
  

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Access sessionStorage here
      const content1 = sessionStorage.getItem('htmlContent');
      setHtmlContent(content1);

    

    // Retrieve content from sessionStorage
    // console.log("Content from sessionStorage:", content); // Log the content

    // Check if the content is a URL or an HTML string
    const isUrl =
      content &&
      (content.startsWith("http://") || content.startsWith("https://"));
    if (isUrl) {
      setIframeUrl(content);
    } else {
      const newWindow = window.open("", "_self");
      setTimeout(() => {
        //sessionStorage.removeItem("transactionPost");
        // document.body.innerHTML = htmlContent;
        // handleFormSubmit();
        if (newWindow && newWindow.document) {
          newWindow.document.write(content, "_self");
          newWindow.document.close();
        }
      }, 1000);
    }
  }
  }, []);




  const handleIframeLoaded = (e) => {
    // console.log("Iframe loaded:", e);

    if (iframeRef.current) {
      try {
        const iframeDocument =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow.document;
        // console.log("Iframe document:", iframeDocument);

        // Access iframe's URL directly
        const currentUrl = iframeRef.current.contentWindow.location.href;
        // console.log("Current URL:", currentUrl);

        // Extract query parameters
        const params = extractQueryParams(currentUrl);
        // console.log("Extracted params:", params);
        router.push({
          pathname: 'payments/payOK',
          query: params
        });
        // Perform any additional actions based on extracted params
        // For example, setting iframeUrl to null if you want to clear it
        setIframeUrl(null);
      } catch (error) {
        console.error("Error accessing iframe content:", error);
      }
    }
  };

  const extractQueryParams = (url) => {
    const queryParams = {};
    const queryString = url.split("?")[1];
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      for (const [key, value] of urlParams.entries()) {
        queryParams[key] = value;
      }
    }
    return queryParams;
  };

  return (

    <div className="p-1 flex flex-col min-h-screen z-10">
         <Header Heading={'Enter OTP'} logo={logo} width={200} height={60} />
         <main className="flex flex-col items-center justify-center pt-5 px-5 sm:ml-5 sm:mr-5">
      {iframeUrl ? (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Embedded Content"
          style={{ height: "100%", width: "100%", border: "none" }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onLoad={handleIframeLoaded}
        />
      ) : (
        <div
          ref={formContainerRef}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      </main>

      <Footer />
    </div>
  );
};

export default ProcessHTML
