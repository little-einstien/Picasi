const crypto = require('crypto');
const config = require('../config/config');
const ENCRYPTION_KEY = config.ENCRYPTION_KEY; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function generateHash(text) {

    var hash = crypto.createHash('md5').update(text).digest('hex');
    console.log(hash);

    return hash;
}

module.exports = { generateHash };