
class CryptoWrap {
    constructor() {
        this.keyPair;
        this.defaultOptions = {
            name: "RSA-OAEP", // Algorithm
            modulusLength: 2048, // The length in bits of the RSA modulus.
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537 
            hash: "SHA-256", // Name of the digest function to use.
        };
    }
    async generateKeyPair() {
        const algorithm = this.defaultOptions;
        const extractable = true; // Indicating whether it will be possible to export
        const keyUsages = ["encrypt", "decrypt"]; // Indicating what can be done with the newly generated key
        this.keyPair = await window.crypto.subtle.generateKey(algorithm, extractable, keyUsages);
    }
    async getPublicKey() {
        const format = 'spki';
        const key = this.keyPair.publicKey;
        const publicKey = await window.crypto.subtle.exportKey(format, key);
        return this.arrayBufferToBase64(publicKey);
    }

    async getPrivateKey() {
        const format = 'pkcs8'; // standard syntax for storing private key information
        const key = this.keyPair.privateKey;
        const privateKey = await window.crypto.subtle.exportKey(format, key);
        return this.arrayBufferToBase64(privateKey);
    }

    async getPublicKeyPem() {
        const base64Key = await this.getPublicKey();
        return this.base64ToPem(base64Key, 'PUBLIC KEY');
    }

    async getPrivateKeyPem() {
        const base64Key = await this.getPrivateKey();
        return this.base64ToPem(base64Key, 'PRIVATE KEY');
    }

    base64ToPem(base64Key, label) {
        const pemHeader = `-----BEGIN ${label}-----\n`;
        const pemFooter = `\n-----END ${label}-----`;
        const base64KeyWithLineBreaks = base64Key.match(/.{1,64}/g).join('\n');
        return pemHeader + base64KeyWithLineBreaks + pemFooter;
    }

    pemToBase64(pemKey) {
        const base64Data = pemKey.replace(/-----BEGIN [^-]+-----|-----END [^-]+-----/g, '').replace(/\n/g, '');
        return base64Data;
    }

    arrayBufferToBase64(buffer) {
        const byteArray = new Uint8Array(buffer);
        let byteString = '';
        for (let i = 0; i < byteArray.byteLength; i++) {
            byteString += String.fromCharCode(byteArray[i]);
        }
        const base64Key = btoa(byteString);
        return base64Key;
    }

    base64ToArrayBuffer(base64) {
        const byteString = atob(base64);
        const uint8Array = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        return uint8Array.buffer;
    }

    async encrypt(publicKey, plainText) {
        const encodedPlaintext = new TextEncoder().encode(plainText).buffer;
        const format = 'spki';
        const keyData = this.base64ToArrayBuffer(this.pemToBase64(publicKey));
        const algorithm = this.defaultOptions;
        const extractable = true;
        const keyUsages = ['encrypt'];

        const secretKey = await crypto.subtle.importKey(format, keyData, algorithm, extractable, keyUsages);
        const encryptedData = await crypto.subtle.encrypt({
            name: 'RSA-OAEP',
        }, secretKey, encodedPlaintext);

        return this.arrayBufferToBase64(encryptedData);
    }

    async decrypt(privateKey, base64encoded) {

        const buffer = this.base64ToArrayBuffer(base64encoded);
        const format = 'pkcs8';
        const keyData = this.base64ToArrayBuffer(this.pemToBase64(privateKey));
        const algorithm = this.defaultOptions;
        const extractable = true;
        const keyUsages = ['decrypt'];

        const secretKey = await crypto.subtle.importKey(format, keyData, algorithm, extractable, keyUsages);
        const decryptedData = await crypto.subtle.decrypt({
            name: 'RSA-OAEP',
        }, secretKey, buffer);

        const uint8Array = new Uint8Array(decryptedData);
        const decodedString = new TextDecoder().decode(uint8Array);
        return decodedString;
    }

}