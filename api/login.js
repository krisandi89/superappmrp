// /api/login.js
import { kv } from '@vercel/kv';

const DEFAULT_USERS = {
  krisandi: { password: '12345', role: 'admin', createdAt: new Date().toISOString() },
  wira: { password: '12345', role: 'user', createdAt: new Date().toISOString() },
  denny: { password: '12345', role: 'user', createdAt: new Date().toISOString() },
  valdy: { password: '12345', role: 'user', createdAt: new Date().toISOString() },
  astri: { password: '12345', role: 'user', createdAt: new Date().toISOString() },
  isparmo: { password: '12345', role: 'user', createdAt: new Date().toISOString() },
  zaman: { password: '12345', role: 'user', createdAt: new Date().toISOString() },
  rifa: { password: '12345', role: 'user', createdAt: new Date().toISOString() }
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ success: false, message: 'Metode tidak diizinkan' });
  }

  try {
    const { username, password } = request.body || {};
    if (!username || !password) {
      return response.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanPassword = String(password);

    // Ambil daftar user dari Vercel KV
    let users = await kv.get('app_users');

    // Jika belum ada di KV, lakukan seeding akun default
    if (!users || typeof users !== 'object' || Object.keys(users).length === 0) {
      users = { ...DEFAULT_USERS };
      await kv.set('app_users', users);
    } else {
      // Pastikan akun master admin selalu ada
      if (!users['krisandi']) {
        users['krisandi'] = { password: '12345', role: 'admin', createdAt: new Date().toISOString() };
        await kv.set('app_users', users);
      }
    }

    const user = users[cleanUsername];
    if (user && user.password === cleanPassword) {
      const role = user.role || (cleanUsername === 'krisandi' ? 'admin' : 'user');
      return response.status(200).json({
        success: true,
        username: cleanUsername,
        role: role
      });
    }

    return response.status(401).json({
      success: false,
      message: 'Username atau password salah.'
    });

  } catch (error) {
    console.error('Error saat verifikasi login:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat verifikasi login.' });
  }
}
