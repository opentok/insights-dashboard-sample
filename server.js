require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');

const API_KEY = process.env.REACT_APP_API_KEY;
const API_SECRET = process.env.API_SECRET;
const CLIENT_URL = process.env.APP_CLIENT_URL;
const PORT = process.env.SERVER_PORT || 4000;

/**
 * Ensure all the required variables are set for the environment
 */
if (!API_KEY || !API_SECRET || !CLIENT_URL) {
  console.error('You need to set your env variables before running the project.');
  return;
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
  const currentTime = Math.floor(new Date() / 1000);
  const token = jwt.sign({
    iss: API_KEY,
    ist: 'project',
    iat: currentTime,
    exp: currentTime + (60 * 60) // 1 hour
  }, API_SECRET);
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
