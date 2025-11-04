// import CryptoJS from 'crypto-js';

// //const secKey = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";
// const secKey = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";

// const EncryptionUtils = {
//   keySize: 256,
//   salt: CryptoJS.enc.Utf8.parse('1203199320052021'),
//   iv: CryptoJS.enc.Utf8.parse('1203199320052021'),
//   encryptSecretKey: secKey,

//   generateKey: function () {
//     return CryptoJS.PBKDF2(this.encryptSecretKey, this.salt, {
//       keySize: this.keySize / 32,
//       iterations: 100
//     });
//   },

//   encryptText: function (msg) {
//     var key = this.generateKey();

//     var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(msg), key, {
//       keySize: this.keySize / 32,
//       iv: this.iv,
//       mode: CryptoJS.mode.CBC,
//       padding: CryptoJS.pad.Pkcs7
//     });

//     return encrypted.toString();
//   },

//   decryptText: function (encryptedText) {
//     try {
//       var key = this.generateKey();
  
//       var decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
//         keySize: this.keySize / 32,
//         iv: this.iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7
//       });
  
//       // Convert the decrypted data to a UTF-8 string
//       var decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  
//       return decryptedText;
//     } catch (error) {
//       console.error('Decryption error:', error);
//       return null; // or handle the error in an appropriate way
//     }
//   }
  
// };

// export default EncryptionUtils;


import crypto from 'crypto';

const secKey = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";

const EncryptionUtils = {
  keySize: 256,
  salt: Buffer.from('1203199320052021', 'utf8'),
  iv: Buffer.from('1203199320052021', 'utf8'),
  encryptSecretKey: secKey,

  generateKey: function () {
    return crypto.pbkdf2Sync(this.encryptSecretKey, this.salt, 100, this.keySize / 8, 'sha1');
  },

  encryptText: function (msg) {
   const password = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";// Replace with your actual key
       const salt = Buffer.from('1203199320052021', 'utf8');
       const iv = Buffer.from('1203199320052021', 'utf8');
   
       // Derive the key using PBKDF2 with 100 iterations
       const key = crypto.pbkdf2Sync(password, salt, 100, 32, 'sha1'); // Use 'sha1' to match C#'s Rfc2898DeriveBytes
   
       // Create AES cipher
       const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
       cipher.setAutoPadding(true); // Enable PKCS7 padding
   
       // Encrypt the data
       let encrypted = cipher.update(msg, 'utf8', 'base64');
       encrypted += cipher.final('base64');

    return encrypted;
  },

  decryptText: function (encryptedMsg) {
    const key = this.generateKey();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, this.iv);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encryptedMsg, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

};

export default EncryptionUtils;