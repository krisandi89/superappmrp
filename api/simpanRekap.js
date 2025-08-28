// /api/simpanRekap.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const { data, username } = request.body;

    if (!data || !data.projectInfo || !data.projectInfo.rekapNumber || !username) {
      return response.status(400).json({ success: false, message: 'Data tidak lengkap. Username dan Nomor Rekap wajib diisi.' });
    }

    data.savedAt = new Date().toISOString();
    const rekapNumber = data.projectInfo.rekapNumber;
    const key = `${username}-${rekapNumber}`;

    await kv.set(key, data);

    return response.status(200).json({ success: true, message: 'Data Rekap berhasil disimpan.', key: key });

  } catch (error) {
    console.error('Error saat menyimpan Rekap:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
