// Import library Vercel KV untuk berinteraksi dengan database
import { kv } from '@vercel/kv';

// Export fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode GET untuk mengambil data
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    // Ambil ppuNumber dari query URL (contoh: /api/ambilPPU?ppuNumber=PPU-123)
    const { ppuNumber } = request.query;

    if (!ppuNumber) {
      return response.status(400).json({ success: false, message: 'Nomor PPU diperlukan.' });
    }

    // Ambil data dari Vercel KV berdasarkan ppuNumber
    const data = await kv.get(ppuNumber);

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
