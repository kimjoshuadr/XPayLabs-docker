import JSEncrypt from 'jsencrypt/bin/jsencrypt.min.js';
// Key pair generation http://web.chacuo.net/netrsakeypair

const publicKey = import.meta.env.VITE_APP_RSA_PUBLIC_KEY;

// Storing private keys on the frontend is not recommended, nor is decrypting data, since it is transparent and of little value
const privateKey = import.meta.env.VITE_APP_RSA_PRIVATE_KEY;

// Encrypt
export const encrypt = (txt: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey); // Set public key
  return encryptor.encrypt(txt); // Encrypt the data
};

// Decrypt
export const decrypt = (txt: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(privateKey); // Set private key
  return encryptor.decrypt(txt); // Decrypt the data
};
