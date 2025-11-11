// For 1Link
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const qs = require('qs');

const app = express();
app.use(bodyParser.json());

// Replace with actual 1LINK credentials
const CLIENT_ID = '96e753e193f8dd58ac86807c60299a11';
const CLIENT_SECRET = '101e673862bcba10a747d7dff697ce87';
const TOKEN_URL = 'https://sandboxapi.1link.net.pk/uat-1link/sandbox/oauth2/token';
// const RASST_URL = 'https://sandboxapi.1link.net.pk/uat-1link/sandbox/1Link';

// Step 1: API endpoint for NetSuite
app.post('/api/testLink1', async (req, res) => {
  try {
    console.log('Request from NetSuite:', req.body);

    // Extract payload from NetSuite
    // const { recordId, amount, message } = req.body;

    // Step 2: Get OAuth token
    const tokenResponse = await axios.post(TOKEN_URL, qs.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: '1LinkApi'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
// debugger;
    const accessToken = tokenResponse.data.access_token;
    console.log('Access Token:', accessToken);

    // Step 3: Prepare 1LINK IBFT / Raast API payload
    const oneLinkPayload = req.body;

    console.log('link payload', oneLinkPayload);
    // Step 4: Call 1LINK IBFT API
    const ibftResponse = await axios.post('https://sandboxapi.1link.net.pk/uat-1link/sandbox/funds-transfer-rest-service/path-1', oneLinkPayload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-IBM-Client-Id': '96e753e193f8dd58ac86807c60299a11'
      }
    });

    console.log('1LINK Response headers:', ibftResponse.headers);
    console.log('1LINK Response:', ibftResponse.data);

    // Step 5: Send response back to NetSuite
    res.json({
      status: 'SUCCESS',
      oneLinkResponse: ibftResponse.data
    });

  } catch (error) {
    console.error('Error in middleware:', error.response ? error.response.data : error.message);
    res.status(500).json({
      status: 'FAILED',
      message: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Middleware running on http://localhost:${PORT}`);
});

module.exports = app;
