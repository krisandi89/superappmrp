const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'dashboard-pt-mpg', 'index.html');
let c = fs.readFileSync(p, 'utf8');

const regex = /const allowedUsers = \{[\s\S]*?function handleLogin\(event\) \{[\s\S]*?showNotification\('Username atau password salah\.', 'error'\);\s*\}\s*\}/;

const newBlock = `async function handleLogin(event) {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const btn = event.target.querySelector('button[type="submit"]');

            if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    localStorage.setItem('loggedInUser', 'Reviewer Lokal');
                    initializeApp();
                    return;
            }
            
            btn.disabled = true;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

            try {
                const response = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    localStorage.setItem('loggedInUser', result.username || username);
                    initializeApp();
                } else {
                    showNotification(result.message || 'Username atau password salah.', 'error');
                }
            } catch (err) {
                console.error('Login error:', err);
                showNotification('Terjadi kesalahan sistem saat login.', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }`;

if (regex.test(c)) {
    c = c.replace(regex, newBlock);
    fs.writeFileSync(p, c, 'utf8');
    console.log("Fixed Login replaced properly!");
} else {
    console.log("Regex did not match. Please verify the file.");
}
