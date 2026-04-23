const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, '..', 'dashboard-pt-mpg', 'Asset', 'LOGO Multipatria - FIX-Crop.png');
const base64Data = fs.readFileSync(imgPath, { encoding: 'base64' });
const dataURI = `data:image/png;base64,${base64Data}`;

const htmlPath = path.join(__dirname, '..', 'dashboard-pt-mpg', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/const logoUrl = new URL\("Asset\/LOGO Multipatria - FIX-Crop\.png", window\.location\.href\)\.href;/g, `const logoUrl = "${dataURI}";`);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Base64 injected!');
