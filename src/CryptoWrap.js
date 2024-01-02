class CryptoWrap {
    constructor() {
        this.keyPair;
    }
    _arrayBufferToBase64(buffer) {
        const binary = new Uint8Array(buffer);
        return btoa(String.fromCharCode(...binary));
    }
    _base64ToArrayBuffer(base64) {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
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
    _pemToUint8Array(pem) {
        const base64Data = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/g, '');
        return this._base64ToArrayBuffer(base64Data);
    }
}