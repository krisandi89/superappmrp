const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dashboard-pt-mpg', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/height:28px;/g, 'height:36px;');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Logo resized to 36px!');
