
class CryptoWrap {
    constructor() {
        this.defaultOptions = {
            name: "RSA-OAEP", // Algorithm
            modulusLength: 2048, // The length in bits of the RSA modulus.
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537 
            extractable: true, // Indicating whether it will be possible to export the key using
            hash: "SHA-256", // Name of the digest function to use.
        };
        this.keyPair;
    }
    async generateKeyPair() {
        const algorithm = this.defaultOptions;
        const extractable = true;
        const keyUsages = ["encrypt", "decrypt"];
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

    async base64ToPem(base64Key, label) {
        const pemHeader = `-----BEGIN ${label}-----\n`;
        const pemFooter = `\n-----END ${label}-----`;
        const base64KeyWithLineBreaks = base64Key.match(/.{1,64}/g).join('\n');
        return pemHeader + base64KeyWithLineBreaks + pemFooter;
    }

    async pemToBase64(pemKey) {
        const base64Data = pemKey.replace(/-----BEGIN [^-]+-----|-----END [^-]+-----/g, '').replace(/\n/g, '');
        return base64Data;
    }

    async arrayBufferToBase64(buffer) {
        const byteArray = new Uint8Array(buffer);
        let byteString = '';
        for (let i = 0; i < byteArray.byteLength; i++) {
            byteString += String.fromCharCode(byteArray[i]);
        }
        const base64Key = window.btoa(byteString);
        return base64Key;
    }
}