// /api/hapusRekap.js
import { kv } from '@vercel/kv';
import { requireSession, isDocumentNumber } from '../session.js';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const session = await requireSession(request, response);
    if (!session) return;
    const { username } = session;
    // PERBAIKAN: Menggunakan variabel 'number' agar sesuai dengan data yang dikirim dari aplikasi.
    const { number } = request.body || {};

    if (!isDocumentNumber(number, 'REKAP')) {
      return response.status(400).json({ success: false, message: 'Nomor Rekap diperlukan.' });
    }

    const key = `${username}-${number}`;
    const data = await kv.get(key);
    if (!data) return response.status(404).json({ success: false, message: 'Rekap tidak ditemukan untuk dihapus.' });
    const source = data.projectInfo?.sourcePpuNumber || '';
    const result = await kv.eval(`
      local raw = redis.call('GET', KEYS[1])
      if not raw then return 0 end
      local current = cjson.decode(raw)
      if (current.projectInfo.sourcePpuNumber or '') ~= ARGV[1] then return -1 end
      if ARGV[1] ~= '' and redis.call('GET', KEYS[2]) == ARGV[2] then
        redis.call('DEL', KEYS[2])
      end
      return redis.call('DEL', KEYS[1])
    `, [key, source ? 'mrp:rekap:' + username + ':' + source : key], [source, number]);

    if (result === -1) {
      return response.status(409).json({ success: false, message: 'Rekap berubah. Muat ulang sebelum menghapus.' });
    }


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
