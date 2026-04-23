const fs = require('fs');

const path = '\\\\nuclearstorage\\home\\PERSONAL\\FAMILY\\SANDI\\Aplikasi Antigravity\\Super-app-MPG\\dashboard-pt-mpg\\index.html';
let content = fs.readFileSync(path, 'utf8');

const oldLoginCode = `const allowedUsers = {
            'krisandi': '12345', 'wira': '12345', 'denny': '12345',
            'valdy': '12345', 'astri': '12345', 'isparmo': '12345',
            'zaman': '12345', 'rifa': '12345',
        };

        function handleLogin(event) {
            event.preventDefault();
            const username = document.getElementById('username').value.toLowerCase();
            const password = document.getElementById('password').value;

            if (allowedUsers[username] && allowedUsers[username] === password) {
                localStorage.setItem('loggedInUser', username);
                initializeApp();
            } else {
                showNotification('Username atau password salah.', 'error');
            }
        }`;

const newLoginCode = `async function handleLogin(event) {
            event.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const btn = event.target.querySelector('button[type="submit"]');
            
            btn.disabled = true;
            const originalText = btn.innerText;
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

content = content.replace(oldLoginCode, newLoginCode);
fs.writeFileSync(path, content, 'utf8');
console.log("Login mutation completed!");
