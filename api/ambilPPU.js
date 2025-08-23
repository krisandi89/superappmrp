// /api/ambilPPU.js
import { kv } from '@vercel/kv';

// Fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode GET untuk mengambil data
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    // Ambil ppuNumber dan username dari query URL
    const { ppuNumber, username } = request.query;

    if (!ppuNumber || !username) {
      return response.status(400).json({ success: false, message: 'Nomor PPU dan Username diperlukan.' });
    }

    // Buat kunci yang benar untuk mengambil data
    const key = `${username}-${ppuNumber}`;

    // Ambil data dari Vercel KV berdasarkan kunci
    const data = await kv.get(key);

    // Jika data tidak ditemukan, kirim pesan error
    if (!data) {
      return response.status(404).json({ success: false, message: 'Data PPU tidak ditemukan.' });
    }

    // Jika data ditemukan, kirim datanya
    return response.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error('Error saat mengambil PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
