const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'dashboard-pt-mpg', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(
    /\.a4-container\{width:\s*100%;\s*height:\s*auto;\s*margin:\s*0;\s*padding:\s*0;\s*box-shadow:\s*none;\s*border:\s*none;\}/g,
    '.a4-container{width:210mm;min-height:297mm;margin:2rem auto;padding:1.5cm;box-shadow:0 0 10px rgba(0,0,0,0.1);background:white;border:1px solid #ddd;}'
);

html = html.replace(
    /@media print\{body\{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0;\}\.no-print\{display:none !important;\}\}/g,
    '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0;}.no-print{display:none !important;}.a4-container{width:100%;min-height:0;margin:0;padding:0;box-shadow:none;border:none;}}'
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Rekap layout styled identical to PPU.');
