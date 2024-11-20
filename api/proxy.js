// api/proxy.js

const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers at the very beginning
  res.setHeader('Access-Control-Allow-Origin', 'https://emerentius.com'); // Replace with your actual domain
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
    // Decode the URL
    const targetUrl = decodeURIComponent(url);

    // Validate the URL protocol
    if (!/^https?:\/\//i.test(targetUrl)) {
      res.status(400).json({ error: 'Invalid URL protocol. Only HTTP and HTTPS are supported.' });
      return;
    }

    // Optionally, implement a whitelist to restrict proxied domains
    const allowedDomains = ['amzn.to', 'www.amazon.com'];
    const parsedUrl = new URL(targetUrl);
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      res.status(403).json({ error: 'Forbidden: Domain not allowed.' });
      return;
    }

    // Fetch the target URL's content
    const response = await axios.get(targetUrl, {
      headers: {
        // You can add headers here if needed
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
    res.setHeader('Access-Control-Allow-Origin', 'https://emerentius.com'); // Replace with your actual domain

    res.send(response.data);
  } catch (error) {
    console.error(`Error fetching URL (${url}):`, error.message);
    res.status(500).json({ error: 'Failed to fetch the requested URL.' });
  }
};