const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'dashboard-pt-mpg', 'index.html');
let c = fs.readFileSync(p, 'utf8');

const targetUrl = 'const logoUrl = "https://raw.githubusercontent.com/krisandi89/rekap/main/LOGO%20MULTIBANGUN%20(Primary).png";';
const newUrl = 'const logoUrl = new URL("Asset/LOGO Multipatria - FIX-Crop.png", window.location.href).href;';

c = c.replace(new RegExp(targetUrl.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), newUrl);

fs.writeFileSync(p, c, 'utf8');
console.log("Logo paths updated in print previews!");
