// /api/updateStatusPPU.js
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const { username, ppuNumber, isRekapDone } = request.body;

    if (!username || !ppuNumber || isRekapDone === undefined) {
      return response.status(400).json({ success: false, message: 'Data tidak lengkap. Username, ppuNumber, dan isRekapDone wajib diisi.' });
    }

    const key = `${username}-${ppuNumber}`;
    const data = await kv.get(key);

    if (!data) {
      return response.status(404).json({ success: false, message: 'Data PPU tidak ditemukan.' });
    }

    data.isRekapDone = !!isRekapDone;
    await kv.set(key, data);

    return response.status(200).json({ success: true, message: 'Status rekap PPU berhasil diperbarui.', isRekapDone: data.isRekapDone });

  } catch (error) {
    console.error('Error saat update status rekap PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat memperbarui status rekap.' });
  }
}
