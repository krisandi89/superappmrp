// /api/ambilSemuaNomorPPU.js
import { kv } from '@vercel/kv';

// Fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode GET
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    // Ambil username dari query URL
    const { username } = request.query;
    if (!username) {
        return response.status(400).json({ success: false, message: 'Username diperlukan.' });
    }

    const keys = [];
    // Buat pola pencarian kunci berdasarkan username
    const matchPattern = `${username}-PPU-*`;
    
    // Pindai semua kunci di database yang cocok dengan pola
    for await (const key of kv.scanIterator({ match: matchPattern })) {
      keys.push(key);
    }

    // Kirim semua kunci yang ditemukan sebagai respon
    return response.status(200).json({ success: true, keys: keys });

  } catch (error) {
    console.error('Error saat mengambil semua kunci PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
