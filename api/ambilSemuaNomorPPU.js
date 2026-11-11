// /api/ambilSemuaNomorPPU.js
import { kv } from '@vercel/kv';
import { requireSession } from '../session.js';

// Fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode GET
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const session = await requireSession(request, response);
    if (!session) return;
    const { username } = session;
    // Ambil username dari query URL
    const keys = [];
    // Buat pola pencarian kunci berdasarkan username
    const matchPattern = `${username}-PPU-*`;

    // Pindai semua kunci di database yang cocok dengan pola
    for await (const key of kv.scanIterator({ match: matchPattern })) {
      keys.push(key);
    }

    const linkedPpus = [];
    if (request.query?.includeRekap === '1') {
      for (let offset = 0; offset < keys.length; offset += 100) {
        const numbers = keys.slice(offset, offset + 100).map(key => key.slice(username.length + 1));
        const links = await kv.mget(...numbers.map(number => 'mrp:rekap:' + username + ':' + number));
        links.forEach((link, index) => { if (link) linkedPpus.push(numbers[index]); });
      }
    }
    return response.status(200).json({ success: true, keys, linkedPpus });

  } catch (error) {
    console.error('Error saat mengambil semua kunci PPU:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}
