// /api/hapusRekap.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    // PERBAIKAN: Menggunakan variabel 'number' agar sesuai dengan data yang dikirim dari aplikasi.
    const { username, number } = request.body;

    if (!username || !number) {
      return response.status(400).json({ success: false, message: 'Username dan Nomor Rekap diperlukan.' });
    }

    const key = `${username}-${number}`;
    const result = await kv.del(key);

    if (result > 0) {
        return response.status(200).json({ success: true, message: 'Rekap berhasil dihapus.' });
    } else {
        return response.status(404).json({ success: false, message: 'Rekap tidak ditemukan untuk dihapus.' });
    }

  } catch (error) {
    console.error('Error saat menghapus Rekap:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
