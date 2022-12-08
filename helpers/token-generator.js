const jwt = require('jsonwebtoken');
const fs = require('fs');

const EXPIRATION_SECS = (60 * 60); // 1 hour

const getCurrentTime = () => Math.floor(new Date() / 1000);

const createTokenTokBox = (apiKey, apiSecret) => {
  const currentTime = getCurrentTime();
  return jwt.sign({
    iss: apiKey,
    ist: 'project',
    iat: currentTime,
    exp: currentTime + EXPIRATION_SECS
  }, apiSecret);
};

const createTokenNexmo = (applicationId, privateKeyPath) => {
  const privateKey = fs.readFileSync(privateKeyPath);
  const currentTime = getCurrentTime();
  return jwt.sign({
    iat: currentTime,
    exp: currentTime + EXPIRATION_SECS,
    application_id: applicationId
  }, privateKey, { algorithm: "RS256" });
};

module.exports = {
  createTokenTokBox,
  createTokenNexmo,
};
