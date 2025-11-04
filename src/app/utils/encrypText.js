const crypto = require('crypto');
// const password = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";// Replace with your actual key


function encrypt(cipherText) {
    const password = "u)16'#Z3,BWotF@y!o^$Aw}[+Is(-jrqd2V";// Replace with your actual key
    const salt = Buffer.from('1203199320052021', 'utf8');
    const iv = Buffer.from('1203199320052021', 'utf8');

    // Derive the key using PBKDF2 with 100 iterations
    const key = crypto.pbkdf2Sync(password, salt, 100, 32, 'sha1'); // Use 'sha1' to match C#'s Rfc2898DeriveBytes

    // Create AES cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    cipher.setAutoPadding(true); // Enable PKCS7 padding

    // Encrypt the data
    let encrypted = cipher.update(cipherText, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
}

// Example usage
// const encryptedText = encrypt('024294uNuf29HnlFG7PGwek8IRgx6gDhOaE8WiPUwYkM572zbuhnyzq6HsPtuVu9M3JbD');
// console.log(encryptedText);