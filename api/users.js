// /api/users.js
import { kv } from '@vercel/kv';
import { endSession, requireSession, startSession } from '../session.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ success: false, message: 'Metode tidak diizinkan' });
  }

  try {
    const { action, username, password, newUsername, newPassword, targetUsername, role } = request.body || {};

    response.setHeader('Cache-Control', 'no-store');
    if (action === 'logout') {
      await endSession(request, response);
      return response.status(200).json({ success: true });
    }

    const users = await kv.get('app_users') || {};

    // 1. ACTION: LOGIN
    if (action === 'login') {
      if (!username || !password) {
        return response.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
      }
      const cleanUsername = String(username).trim().toLowerCase();
      const cleanPassword = String(password);

      const user = Object.hasOwn(users, cleanUsername) && users[cleanUsername];
      if (user && user.password === cleanPassword) {
        const userRole = user.role || (cleanUsername === 'krisandi' ? 'admin' : 'user');
        await startSession(response, cleanUsername, user);
        return response.status(200).json({
          success: true,
          username: cleanUsername,
          role: userRole
        });
      }

      return response.status(401).json({
        success: false,
        message: 'Username atau password salah.'
      });
    }

    const session = await requireSession(request, response, users);
    if (!session) return;
    if (action === 'session') return response.status(200).json({ success: true, ...session });
    if (session.role !== 'admin') {
      return response.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengelola pengguna.' });
    }
    const cleanAdmin = session.username;

    // 2. ACTION: LIST USERS
    if (action === 'list') {
      const userList = Object.keys(users).map(uname => ({
        username: uname,
        role: users[uname].role || 'user',
        createdAt: users[uname].createdAt || null
      }));
      // Urutkan admin di atas, lalu alfabetis
      userList.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return a.username.localeCompare(b.username);
      });
      return response.status(200).json({ success: true, users: userList });
    }

    // 3. ACTION: ADD USER
    if (action === 'add') {
      if (!newUsername || !newPassword) {
        return response.status(400).json({ success: false, message: 'Username dan Password baru wajib diisi.' });
      }

      const cleanNewUser = String(newUsername).trim().toLowerCase();
      if (!/^[a-z0-9_-]{3,20}$/.test(cleanNewUser)) {
        return response.status(400).json({
          success: false,
          message: 'Username harus 3-20 karakter, hanya huruf kecil, angka, garis bawah (_), atau tanda hubung (-).'
        });
      }

      if (Object.hasOwn(users, cleanNewUser)) {
        return response.status(400).json({ success: false, message: `Username "${cleanNewUser}" sudah terdaftar.` });
      }

      if (String(newPassword).length < 3) {
        return response.status(400).json({ success: false, message: 'Password minimal 3 karakter.' });
      }

      users[cleanNewUser] = {
        password: String(newPassword),
        role: role === 'admin' ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };

      await kv.set('app_users', users);
      return response.status(200).json({ success: true, message: `Pengguna "${cleanNewUser}" berhasil ditambahkan.` });
    }

    // 4. ACTION: UPDATE PASSWORD
    if (action === 'updatePassword') {
      if (!targetUsername || !newPassword) {
        return response.status(400).json({ success: false, message: 'Username target dan Password baru wajib diisi.' });
      }

      const cleanTarget = String(targetUsername).trim().toLowerCase();
      if (!Object.hasOwn(users, cleanTarget)) {
        return response.status(404).json({ success: false, message: `Pengguna "${cleanTarget}" tidak ditemukan.` });
      }

      if (String(newPassword).length < 3) {
        return response.status(400).json({ success: false, message: 'Password baru minimal 3 karakter.' });
      }

      users[cleanTarget].password = String(newPassword);
      await kv.set('app_users', users);
      return response.status(200).json({ success: true, message: `Password untuk "${cleanTarget}" berhasil diperbarui.` });
    }

    // 5. ACTION: DELETE USER
    if (action === 'delete') {
      if (!targetUsername) {
        return response.status(400).json({ success: false, message: 'Username target wajib ditentukan.' });
      }

      const cleanTarget = String(targetUsername).trim().toLowerCase();
      if (cleanTarget === 'krisandi') {
        return response.status(400).json({ success: false, message: 'Akun Master Admin "krisandi" diproteksi dan tidak dapat dihapus.' });
      }

      if (cleanTarget === cleanAdmin) {
        return response.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.' });
      }

      if (!Object.hasOwn(users, cleanTarget)) {
        return response.status(404).json({ success: false, message: `Pengguna "${cleanTarget}" tidak ditemukan.` });
      }

      delete users[cleanTarget];
      await kv.set('app_users', users);
      return response.status(200).json({ success: true, message: `Pengguna "${cleanTarget}" berhasil dihapus.` });
    }

    return response.status(400).json({ success: false, message: 'Aksi tidak dikenali.' });

  } catch (error) {
    console.error('Error saat kelola pengguna:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memproses data pengguna.' });
  }
}
