const jwt = require('jsonwebtoken');
const { v1 } = require('uuid');

const EXPIRATION_SECS = (60 * 60); // 1 hour

const getCurrentTime = () => Math.floor(new Date() / 1000);

/**
 * Generates a new token for TokBox users
 * @param apiKey - TokBox API Key
 * @param apiSecret - TokBox API Secret
 */
const createOpenTokToken = (apiKey, apiSecret) => {
  const currentTime = getCurrentTime();
  return jwt.sign({
    iss: apiKey,
    ist: 'project',
    iat: currentTime,
    exp: currentTime + EXPIRATION_SECS
  }, apiSecret);
};

/**
 * Generates a new token for Vonage users
 * @param applicationId - Vonage Application ID
 * @param privateKey - Buffer containing the private key
 */
const createVonageToken = (applicationId, privateKey) => {
  if (!(privateKey instanceof Buffer)) {
    throw new Error("You must set up your private key file.");
  }
  const currentTime = getCurrentTime();
  return jwt.sign({
    iat: currentTime,
    jti: v1(),
    exp: currentTime + EXPIRATION_SECS,
    application_id: applicationId
  }, privateKey, { algorithm: "RS256" });
};

module.exports = {
  createOpenTokToken,
  createVonageToken,
};
