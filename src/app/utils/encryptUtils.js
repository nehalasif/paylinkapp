// const CryptoJS = require("crypto-js"); // Ensure CryptoJS is installed

// /**
//  * Encrypts data using AES encryption.
//  * @param {string | object} data - The data to encrypt. Can be a string or an object.
//  * @returns {string} - The AES-encrypted string.
//  */
// function encryptData(data) {
//     if (!data) {
//         throw new Error("Data is required for encryption");
//     }

//     try {
//         // Convert object to JSON string if necessary
//         const dataString = typeof data === "object" ? JSON.stringify(data) : data;

//         // Encrypt the data
//         const encryptedData = CryptoJS.AES.encrypt(dataString, "2FBC1A0D4B62EABEC9D6E35A9F0D47E967DDBF4A1EC98AC9A711EEB91856B6D4").toString();
//         return encryptedData;
//     } catch (error) {
//         console.error("Error encrypting data:", error);
//         return null;
//     }
// }

// module.exports = {
//     encryptData,
// };






const CryptoJS = require("crypto-js");

function encryptData(data) {
    if (!data) {
        throw new Error("Data is required for encryption");
    }

    try {
        // Convert object to JSON string if necessary
        const dataString = typeof data === "object" ? JSON.stringify(data) : data;

        // Define key and IV (must be the same as .NET)
        const key = CryptoJS.enc.Hex.parse("2FBC1A0D4B62EABEC9D6E35A9F0D47E967DDBF4A1EC98AC9A711EEB91856B6D4"); // 256-bit key
        const iv = CryptoJS.enc.Hex.parse("0000000000000000"); // Example IV, can be passed dynamically if needed

        // Encrypt the data with the key and IV
        const encryptedData = CryptoJS.AES.encrypt(dataString, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();

        return encryptedData;
    } catch (error) {
        console.error("Error encrypting data:", error);
        return null;
    }
}

module.exports = {
    encryptData,
};
