'use client';

import React, { useRef, useEffect } from 'react';
import { useQRCode } from 'next-qrcode'; // QR code library
import html2canvas from 'html2canvas';
import bgQRCode from '../components/Images/Group100000090.png';

const QRCodeWithDownload = () => {
  const hiddenRef = useRef();
  const { Canvas } = useQRCode();

  const handleDownload = async () => {
    if (hiddenRef.current) {
      try {
        const canvas = await html2canvas(hiddenRef.current, {
          scale: 2, // Higher scale for better quality
          useCORS: true, // Handles cross-origin images
        });

        // Convert the canvas to an image
        const imgData = canvas.toDataURL('image/png');

        // Trigger download
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'CustomQRCode.png';
        link.click();
      } catch (error) {
        console.error('Error capturing element:', error);
      }
    }
  };

  return (
    <div>
      {/* Hidden element for generating the image */}
      <div
        ref={hiddenRef} className='w-1/3'
        style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#F5F7FA',
          border:'2px solid',
          margin: 'auto',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          GENERATE QR
        </h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Your Custom Payment QR
        </p>
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '20px' }}>
          Your custom QR code has been created. You can now share the below QR
          code to receive money.
        </p>

        {/* QR Code */}
       <div className='flex justify-center' >
       
       <div style={{ padding: '10px', display: 'inline-block', backgroundImage: `url(${bgQRCode.src})`, backgroundSize: 'cover', backgroundPosition: 'center', }}>
         <Canvas
          text="https://example.com"
          options={{
            width: 'auto',
            margin: 1,
            color: '#000',
            bgColor: 'transparent',
          }}
        /></div>
        </div>
        <p style={{ fontSize: '12px', color: '#666', margin: '10px 0' }}>
          Powered by
        </p>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          Rs. 1000
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Account Title/Business Name
        </p>
        <p style={{ fontSize: '12px', color: '#999' }}>MSISDN: **********319</p>
      </div>

      {/* Button to trigger download */}
      <button
        onClick={handleDownload}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeWithDownload;
