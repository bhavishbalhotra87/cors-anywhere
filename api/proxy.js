// api/proxy.js

const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS for your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://emerentius.com'); // Replace with your domain
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: 'URL parameter is required.' });
    return;
  }

  try {
    // Ensure the URL is valid and starts with http or https
    const targetUrl = decodeURIComponent(url);
    if (!/^https?:\/\//i.test(targetUrl)) {
      res.status(400).json({ error: 'Invalid URL protocol. Only HTTP and HTTPS are supported.' });
      return;
    }

    // Fetch the target URL's content
    const response = await axios.get(targetUrl, {
      headers: {
        // Include any necessary headers here
      },
      responseType: 'arraybuffer', // Handle different response types
      validateStatus: () => true, // Accept all HTTP status codes
    });

    // Forward the response from the target server
    res.status(response.status);
    
    // Copy response headers from target server except for certain headers
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'access-control-allow-origin') {
        res.setHeader(key, value);
      }
    });

    // Ensure CORS headers are present
    res.setHeader('Access-Control-Allow-Origin', 'https://emerentius.com'); // Replace with your domain

    res.send(response.data);
  } catch (error) {
    console.error(`Error fetching URL (${url}):`, error.message);
    res.status(500).json({ error: 'Failed to fetch the requested URL.' });
  }
};