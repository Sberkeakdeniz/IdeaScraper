// Debug endpoint to test environment inside the running API server
const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();

app.get('/debug', (req, res) => {
  const debug = {
    cwd: process.cwd(),
    envPath: path.resolve(__dirname, '../../../.env'),
    polarToken: process.env.POLAR_ACCESS_TOKEN ? `${process.env.POLAR_ACCESS_TOKEN.substring(0, 25)}...` : 'Missing',
    tokenLength: process.env.POLAR_ACCESS_TOKEN?.length || 0,
    orgId: process.env.POLAR_ORGANIZATION_ID || 'Missing',
    priceId: process.env.POLAR_PRO_PRICE_ID || 'Missing',
  };
  
  res.json(debug);
});

app.listen(3005, () => {
  console.log('Debug server running on port 3005');
  console.log('Visit http://localhost:3005/debug');
});