// /api/hapusPPU.js
import { kv } from '@vercel/kv';

// Fungsi utama untuk menangani request hapus PPU
export default async function handler(request, response) {
  // Hanya izinkan metode DELETE
  if (request.method !== 'DELETE') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    // Menggunakan 'number' agar konsisten dengan panggilan dari frontend
    const { username, number } = request.body;

    if (!username || !number) {
      return response.status(400).json({ success: false, message: 'Username dan Nomor PPU diperlukan.' });
    }

    // Buat kunci yang akan dihapus
    const key = `${username}-${number}`;

    // Hapus data dari Vercel KV
    const result = await kv.del(key);

    // kv.del mengembalikan 1 jika berhasil, 0 jika kunci tidak ada
    if (result > 0) {
        return response.status(200).json({ success: true, message: 'PPU berhasil dihapus.' });
    } else {
        return response.status(404).json({ success: false, message: 'PPU tidak ditemukan untuk dihapus.' });
    }

  } catch (error) {
    console.error('Error saat menghapus PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
