// Import library Vercel KV untuk berinteraksi dengan database
import { kv } from '@vercel/kv';

// Export fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode GET
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const keys = [];
    // kv.scanIterator akan memindai semua kunci di database
    // Kita filter hanya yang berawalan "PPU-"
    for await (const key of kv.scanIterator({ match: 'PPU-*' })) {
      keys.push(key);
    }

    // Kirim semua kunci yang ditemukan sebagai respon
    return response.status(200).json({ success: true, keys: keys });

  } catch (error) {
    console.error('Error saat mengambil semua kunci PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
