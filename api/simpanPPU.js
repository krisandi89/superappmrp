// /api/simpanPPU.js
import { kv } from '@vercel/kv';

// Fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode POST untuk menyimpan data
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    // Ambil data PPU dan username dari body request
    const { data, username } = request.body;

    // Pastikan data, ppuNumber, dan username ada
    if (!data || !data.projectInfo || !data.projectInfo.ppuNumber || !username) {
      return response.status(400).json({ success: false, message: 'Data tidak lengkap. Username dan Nomor PPU wajib diisi.' });
    }

    // Tambahkan timestamp saat data disimpan
    data.savedAt = new Date().toISOString();

    const ppuNumber = data.projectInfo.ppuNumber;
    // Buat kunci unik dengan format: username-ppuNumber
    const key = `${username}-${ppuNumber}`;

    // Simpan data ke Vercel KV menggunakan kunci unik tersebut
    await kv.set(key, data);

    // Kirim respon sukses
    return response.status(200).json({ success: true, message: 'Data PPU berhasil disimpan.', key: key });

  } catch (error) {
    console.error('Error saat menyimpan PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
