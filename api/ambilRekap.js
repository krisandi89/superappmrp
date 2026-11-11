// /api/ambilRekap.js
import { kv } from '@vercel/kv';
import { isDocumentNumber, requireSession } from '../session.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const session = await requireSession(request, response);
    if (!session) return;
    const { username } = session;
    const { number, sourcePpu } = request.query || {};

    if (sourcePpu !== undefined) {
      if (!isDocumentNumber(sourcePpu, 'PPU')) {
        return response.status(400).json({ success: false, message: 'Nomor PPU asal tidak valid.' });
      }
      const linkedNumber = await kv.get('mrp:rekap:' + username + ':' + sourcePpu);
      const candidate = linkedNumber || 'REKAP-' + sourcePpu.slice(4);
      const data = await kv.get(username + '-' + candidate);
      if (!data) return response.status(200).json({ success: true, data: null });
      if (data.projectInfo?.sourcePpuNumber === sourcePpu) {
        return response.status(200).json({ success: true, data });
      }
      return response.status(409).json({
        success: false,
        message: 'Nomor ' + candidate + ' sudah dipakai. Periksa Rekap itu dari daftar, lalu tautkan PPU asal jika sesuai.'
      });
    }

    if (!isDocumentNumber(number, 'REKAP')) {
      return response.status(400).json({ success: false, message: 'Nomor Rekap diperlukan.' });
    }
    const data = await kv.get(username + '-' + number);


    if (!data) {
      return response.status(404).json({ success: false, message: 'Data Rekap tidak ditemukan.' });
    }

    return response.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error('Error saat mengambil Rekap:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
