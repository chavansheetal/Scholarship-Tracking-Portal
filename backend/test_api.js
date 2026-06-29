const http = require('http');

const userId = 'NSP/2025/KA/12345';
const url = `http://localhost:5000/api/applications/user/${encodeURIComponent(userId)}`;

console.log('Fetching:', url);

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
