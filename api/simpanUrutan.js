// /api/simpanUrutan.js
import { kv } from '@vercel/kv';

// Fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const { username, type, orderData } = request.body;

    // Validasi data
    if (!username || !type || !orderData || !Array.isArray(orderData)) {
      return response.status(400).json({ success: false, message: 'Data tidak lengkap. Username, type (PPU/REKAP), dan orderData wajib diisi.' });
    }

    // Loop untuk update field order pada tiap-tiap dokumen di Vercel KV
    // Kita gunakan perulangan untuk mengambil data, memodifikasi 'order', lalu menyimpan kembali.
    for (const item of orderData) {
      if (!item.key || item.order === undefined) continue;

      // Buat kunci unik sesuai format yang ada
      const key = `${username}-${item.key}`; // Misalnya 'Username-PPU-123'
      
      let data = await kv.get(key);
      if (data) {
        data.order = item.order;
        await kv.set(key, data);
      }
    }

    // Kirim respon sukses
    return response.status(200).json({ success: true, message: 'Order berhasil disimpan.' });

  } catch (error) {
    console.error('Error saat menyimpan urutan:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat update urutan.' });
  }
}
