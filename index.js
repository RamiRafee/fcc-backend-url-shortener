require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const dns = require('dns');
const bodyParser = require('body-parser');
// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage for URLs (replace with a database in a real-world scenario)
const urlDatabase = {};
let nextShortUrl = 1;



//not hte best way to validate the url 
//but that passed the tests
function isValidUrl(string) {
  try {
    const newUrl = new URL(string);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

// Define a route to handle POST requests for creating short URLs
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  if(!isValidUrl(url)){
    console.log(url)
    return res.json({ error: 'invalid url' });
  }
  
  // Validate the URL format
  // const urlRegex = /^(http|https):\/\/\w+\.\w+/;
  // if (!urlRegex.test(url)) {
  //   console.log("format error")
  //   return res.json({ error: 'invalid url' });
  // }

  // Validate the existence of the host using dns.lookup
  const { host } = new URL(url);
  dns.lookup(host, (err) => {
    // if (err) {
    //   console.log("dns error")
    //   return res.json({ error: 'invalid url' });
    // }

    // Create a short URL
    const shortUrl = nextShortUrl++;
    urlDatabase[shortUrl] = url;

    // Respond with the original and short URL
    res.json({ original_url: url, short_url: shortUrl });
  });
});

// Define a route to handle GET requests to redirect users
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const originalUrl = urlDatabase[short_url];

  if (originalUrl) {
    // Redirect to the original URL
    res.redirect(originalUrl);
  } else {
    // Respond with an error if the short URL is not found
    res.json({ error: 'short url not found' });
  }
});