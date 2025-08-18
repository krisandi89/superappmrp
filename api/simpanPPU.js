// Import library Vercel KV untuk berinteraksi dengan database
import { kv } from '@vercel/kv';

// Export fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode POST untuk menyimpan data
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    // Ambil data PPU dari body request
    const { data } = request.body;

    // Pastikan data dan ppuNumber ada
    if (!data || !data.projectInfo || !data.projectInfo.ppuNumber) {
      return response.status(400).json({ success: false, message: 'Data tidak lengkap atau Nomor PPU tidak ada.' });
    }

    const ppuNumber = data.projectInfo.ppuNumber;

    // Simpan data ke Vercel KV menggunakan ppuNumber sebagai kunci unik
    await kv.set(ppuNumber, data);

    // Kirim respon sukses
    return response.status(200).json({ success: true, message: 'Data PPU berhasil disimpan.', ppuNumber: ppuNumber });

  } catch (error) {
    console.error('Error saat menyimpan PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
