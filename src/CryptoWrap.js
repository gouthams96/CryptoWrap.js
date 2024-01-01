class CryptoWrap {
    constructor() {
        this.keyPair;
    }
    _arrayBufferToBase64(buffer) {
        const binary = new Uint8Array(buffer);
        return btoa(String.fromCharCode(...binary));
    }
    async exportPublicKey() {
        const exportedPublicKey = await window.crypto.subtle.exportKey('spki', this.keyPair.publicKey);
        return this._arrayBufferToBase64(exportedPublicKey);
    }
    async generateKeyPair() {
        this.keyPair = await window.crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 2048,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
        );
    }
    // Convert PEM to Uint8Array
    pemToUint8Array(pem) {
        const base64Data = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/g, '');
        const binaryString = atob(base64Data);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        return uint8Array;
    }
}
