const http = require('http');
const https = require('https');
const port = process.env.PORT || 3000;

const TARGET_URLS = {
   'https://mocktest-alpha.vercel.app/': 'https://my.spline.design/balloonexperience-f4df8becf588d109a3db78cfb1fdc3ea/',
   'abc.localhost:3000': 'https://spectacular-form-243707.framer.app/',
   default: 'https://my.spline.design/balloonexperience-f4df8becf588d109a3db78cfb1fdc3ea/', // Default URL if no match is found
};

function getTargetUrl(req) {
   const origin = req.headers.origin || req.headers.host;
   console.log(origin);
   if (!origin) return TARGET_URLS.default;
   for (const [domain, url] of Object.entries(TARGET_URLS)) {
      if (origin.includes(domain)) {
         return url;
      }
   }
   return TARGET_URLS.default;
}

const server = http.createServer((req, res) => {
   const targetUrl = getTargetUrl(req);
   const protocol = targetUrl.startsWith('https') ? https : http;

   protocol
      .get(targetUrl, (response) => {
         let data = '';
         response.on('data', (chunk) => {
            data += chunk;
         });
         response.on('end', () => {
            // Inject script to hide Framer badge
            const script = `
               <script>
                  document.addEventListener('DOMContentLoaded', function() {
                     var style = document.createElement('style');
                     style.textContent = '#__framer-badge-container { display: none !important; }';
                     document.head.appendChild(style);
                  });
               </script>
            `;
            
            // Inject the script at the end of the body
            const modifiedHtml = data.replace('</body>', script + '</body>');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(modifiedHtml);
         });
      })
      .on('error', (error) => {
         res.writeHead(500, { 'Content-Type': 'text/plain' });
         res.end(`Error fetching content: ${error.message}`);
      });
});

server.listen(port, () => {
   console.log(`Server is running on port ${port}`);
   //a simple comment
});