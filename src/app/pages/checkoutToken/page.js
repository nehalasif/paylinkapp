"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS } from '../../constants/config.js';


export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const param = {
        ObjectValue: "EERCVsTSNRKoQfm48ZDRIlC8k20rS82mmDgz32Ze+tBkys6x985Mz/+Y8XqaXPsI7EEaaGkssnaHkjSxqGGM3dwEaOztwxf0yfZm7D9AUYo=",
      };
      const gatewayTokenResponse = await axios.post(API_URLS.gatewayUrl+'/api/KPPublicToken', param);
      console.log(gatewayTokenResponse.data);
      //const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1'); // Example API endpoint
      setData(gatewayTokenResponse.data);
    }
    fetchData();
  }, []);

  return (
    <div>
      
      <h1>Welcome to My Next.js App</h1>
      {data && <p>Data from API: {data.auth_token}</p>} {/* Conditionally render data */}
      {!data && <p>Loading...</p>}
    </div>
  );
}