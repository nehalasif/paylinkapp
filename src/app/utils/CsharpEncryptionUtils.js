import CryptoJS from 'crypto-js';

// The key must be synchronized across C# and JavaScript.
const secKey = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";

const CsharpEncryptionUtils = {
  // Parameters matching C# Rfc2898DeriveBytes and AES settings
  keySize: 256, // 32 bytes * 8 bits/byte = 256 bits
  salt: CryptoJS.enc.Utf8.parse('1203199320052021'),
  iv: CryptoJS.enc.Utf8.parse('1203199320052021'),
  encryptSecretKey: secKey,

  generateKey: function () {
    // CRITICAL UPDATE: We must explicitly use SHA256 here to match the modern C#
    // Rfc2898DeriveBytes constructor. This ensures the derived key is the same.
    return CryptoJS.PBKDF2(this.encryptSecretKey, this.salt, {
      keySize: this.keySize / 32,
      iterations: 100,
      hasher: CryptoJS.algo.SHA256 // <-- FIX FOR C# SYSLIB0041 COMPATIBILITY
    });
  },

  // Encrypt function included for completeness
  encryptText: function (msg) {
    var key = this.generateKey();

    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(msg), key, {
      keySize: this.keySize / 32,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Apply URL-safe encoding for C# compatibility
    const base64String = encrypted.toString();
    return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },

  decryptText: function (encryptedText) {
    try {
      // 1. REVERSE URL-SAFE TRANSFORMATIONS AND PADDING (Matching C# output format)
      let standardBase64 = encryptedText.replace(/-/g, '+').replace(/_/g, '/');
      
      const paddingNeeded = standardBase64.length % 4;
      if (paddingNeeded === 2) {
          standardBase64 += '==';
      } else if (paddingNeeded === 3) {
          standardBase64 += '=';
      }
      
      // 2. KEY GENERATION (using SHA256 hasher now)
      var key = this.generateKey();
  
      // 3. DECRYPT
      var decrypted = CryptoJS.AES.decrypt(standardBase64, key, {
        keySize: this.keySize / 32,
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // 4. VALIDITY CHECK
      if (!decrypted || decrypted.sigBytes <= 0) {
        console.error('Decryption failed: Ciphertext invalid or key/IV/parameter mismatch.');
        return null;
      }
  
      // 5. CONVERT TO UTF-8 STRING
      var decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  
      return decryptedText;
      
    } catch (error) {
      console.error('Decryption error caught:', error.message);
      return null; 
    }
  }
};

export default CsharpEncryptionUtils;