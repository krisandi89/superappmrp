// /api/ambilSemuaNomorRekap.js
import { kv } from '@vercel/kv';
import { requireSession } from '../session.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const session = await requireSession(request, response);
    if (!session) return;
    const { username } = session;
    const keys = [];
    const matchPattern = `${username}-REKAP-*`;

    for await (const key of kv.scanIterator({ match: matchPattern })) {
      keys.push(key);
    }

    return response.status(200).json({ success: true, keys: keys });

  } catch (error) {
    console.error('Error saat mengambil semua kunci Rekap:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
