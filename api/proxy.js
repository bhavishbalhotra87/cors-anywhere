// api/proxy.js

const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required.' });
    return;
  }

  try {
    // Fetch the target URL's content
    const response = await axios.get(url, {
      headers: {
        // Include any necessary headers here
      }
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://emerentius.com'); // Replace with your domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return the fetched content
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error(`Error fetching URL (${url}):`, error.message);
    res.status(500).json({ error: 'Failed to fetch the requested URL.' });
  }
};