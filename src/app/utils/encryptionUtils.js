import CryptoJS from 'crypto-js';

const secKey = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";

const EncryptionUtils = {
  keySize: 256,
  salt: CryptoJS.enc.Utf8.parse('1203199320052021'),
  iv: CryptoJS.enc.Utf8.parse('1203199320052021'),
  encryptSecretKey: secKey,

  generateKey: function () {
    return CryptoJS.PBKDF2(this.encryptSecretKey, this.salt, {
      keySize: this.keySize / 32,
      iterations: 100
    });
  },

  encryptText: function (msg) {
    var key = this.generateKey();

    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(msg), key, {
      keySize: this.keySize / 32,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  },

  decryptText: function (encryptedText) {
    try {
      var key = this.generateKey();
  
      var decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
        keySize: this.keySize / 32,
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
  
      // Convert the decrypted data to a UTF-8 string
      var decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  
      return decryptedText;
    } catch (error) {
      console.error('Decryption error:', error);
      return null; // or handle the error in an appropriate way
    }
  }
  
};

export default EncryptionUtils;