// /api/simpanUrutan.js
import { kv } from '@vercel/kv';
import { requireSession, isDocumentNumber } from '../session.js';

// Fungsi utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
  // Hanya izinkan metode POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }

  try {
    const session = await requireSession(request, response);
    if (!session) return;
    const { username } = session;
    const { type, orderData } = request.body || {};

    // Validasi data
    if (!['PPU', 'REKAP'].includes(type) || !Array.isArray(orderData)) {
      return response.status(400).json({ success: false, message: 'Data tidak lengkap. Tipe (PPU/REKAP) dan orderData wajib diisi.' });
    }

    // Loop untuk update field order pada tiap-tiap dokumen di Vercel KV
    // Kita gunakan perulangan untuk mengambil data, memodifikasi 'order', lalu menyimpan kembali.
    for (const item of orderData) {
      if (!isDocumentNumber(item?.key, type) || !Number.isInteger(item.order)) continue;

      // Buat kunci unik sesuai format yang ada
      const key = `${username}-${item.key}`; // Misalnya 'Username-PPU-123'
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const value = await kv.eval(READ_ORDER, [key], []);
        if (!value) break;
        const raw = value.slice(1);
        const data = JSON.parse(raw);
        const applied = await kv.eval(SAVE_ORDER, [key], [raw, JSON.stringify({ ...data, order: item.order })]);
        if (applied) break;
        if (attempt === 2) return response.status(409).json({ success: false, message: 'Dokumen berubah. Muat ulang daftar dan coba lagi.' });
      }
    }

    // Kirim respon sukses
    return response.status(200).json({ success: true, message: 'Order berhasil disimpan.' });

  } catch (error) {
    console.error('Error saat menyimpan urutan:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat update urutan.' });
  }
}

const READ_ORDER = `
local raw = redis.call("GET", KEYS[1])
if not raw then return false end
return ":" .. raw
`;

const SAVE_ORDER = `
if redis.call("GET", KEYS[1]) ~= ARGV[1] then return 0 end
redis.call("SET", KEYS[1], ARGV[2])
return 1
`;
