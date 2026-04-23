const fs = require('fs');
const path = require('path');

const targetHtml = path.join(__dirname, '..', 'dashboard-pt-mpg', 'index.html');
let content = fs.readFileSync(targetHtml, 'utf8');

content = content.replace(
    /const response = await fetch\('\/api\/auth'/g,
    `if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    localStorage.setItem('loggedInUser', 'Reviewer Lokal');
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    initializeApp();
                    return;
                }
                
                const response = await fetch('/api/auth'`
);

fs.writeFileSync(targetHtml, content, 'utf8');
console.log("Bypass injected!");
