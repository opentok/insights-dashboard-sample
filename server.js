require('dotenv').config();

const express = require('express');
const fs = require('fs');
const { createTokenTokBox, createTokenNexmo } = require('./helpers/token-generator');

const API_KEY = process.env.REACT_APP_API_KEY;
const API_SECRET = process.env.API_SECRET;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;
const CLIENT_URL = process.env.APP_CLIENT_URL;
const PORT = process.env.SERVER_PORT || 4000;

const isTokBoxApiKey = /^-?\d+$/.test(API_KEY);
let privateKey;

/**
 * Ensure all the required variables are set for the environment
 */
if (!API_KEY || !CLIENT_URL) {
  console.error('You need to set your env variables before running the project.');
  return;
}
if (!API_SECRET && isTokBoxApiKey) {
  console.error('You need to set your secret.');
  return;
}
if (!isTokBoxApiKey) {
  if (!PRIVATE_KEY_PATH) {
    console.error('You need to set your private key.');
    return;
  }
  privateKey = fs.readFileSync(PRIVATE_KEY_PATH);
}

/**
 * Initialize the app
 */
const app = express();

/**
 * CORS Middleware - Allow the client to consume the server API
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_URL);
  next();
});

/**
 * /token - Get a jwt with the configured variables
 * @returns {JSON}
 */
app.get('/token', (req, res) => {
  const token = isTokBoxApiKey ?
    createTokenTokBox(API_KEY, API_SECRET) :
    createTokenNexmo(API_KEY, privateKey);
  res.send(JSON.stringify({
    API_KEY,
    token,
  }));
});

/**
 * Run the server on the specified port
 */
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
