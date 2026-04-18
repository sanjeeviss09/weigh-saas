const https = require('https');

// Replace this with your actual Render backend URL if different
const TARGET_URL = process.env.BACKEND_URL || 'https://logicrate-backend.onrender.com/health';

console.log(`[Keep-Alive] Starting auto-wake service targeting: ${TARGET_URL}`);
console.log(`[Keep-Alive] Ping interval set to 3 minutes.`);

// Function to ping the server
const pingServer = () => {
    console.log(`[Keep-Alive] Pinging ${TARGET_URL} at ${new Date().toISOString()}`);
    
    https.get(TARGET_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`[Keep-Alive] Ping successful! Server responded with status: ${res.statusCode}`);
        });
    }).on('error', (err) => {
        console.error(`[Keep-Alive] Ping failed: ${err.message}`);
    });
};

// Ping immediately on start
pingServer();

// Then ping every 3 minutes (180,000 milliseconds)
setInterval(pingServer, 3 * 60 * 1000);

// If you want this script to double as a tiny web server (e.g. if deployed as a web service itself)
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Auto-wake service is running!\n');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`[Keep-Alive] Web server listening on port ${PORT}`);
});
