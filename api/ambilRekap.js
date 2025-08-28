// /api/ambilRekap.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const { number, username } = request.query;

    if (!number || !username) {
      return response.status(400).json({ success: false, message: 'Nomor Rekap dan Username diperlukan.' });
    }

    const key = `${username}-${number}`;
    const data = await kv.get(key);

    if (!data) {
      return response.status(404).json({ success: false, message: 'Data Rekap tidak ditemukan.' });
    }

    return response.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error('Error saat mengambil Rekap:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
