import { randomUUID } from 'node:crypto';
import { kv } from '@vercel/kv';
import { isDocumentNumber, requireSession } from '../session.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan' });
  }
  try {
    const session = await requireSession(request, response);
    if (!session) return;
    const { username } = session;
    const { data, originalNumber, revision } = request.body || {};
    const number = data?.projectInfo?.rekapNumber;
    const source = data?.projectInfo?.sourcePpuNumber ?? '';
    if (!isDocumentNumber(number, 'REKAP') || (originalNumber !== undefined && originalNumber !== number)
      || (source !== '' && !isDocumentNumber(source, 'PPU'))
      || (source && !originalNumber && number !== 'REKAP-' + source.slice(4))) {
      return response.status(400).json({ success: false, message: 'Nomor Rekap atau PPU asal tidak valid.' });
    }

    const key = username + '-' + number;
    const savedAt = new Date().toISOString();
    const nextRevision = randomUUID();
    const existing = originalNumber ? await kv.get(key) : null;
    const order = existing?.order;
    const saved = { ...data, savedAt, revision: nextRevision, order };
    const status = await kv.eval(SAVE_REKAP, [
      key, source ? username + '-' + source : key, source ? 'mrp:rekap:' + username + ':' + source : key
    ], [originalNumber ? 'edit' : 'create', source, number, revision ?? '', JSON.stringify(saved), JSON.stringify(order ?? null)]);
    const errors = {
      duplicate: [409, 'Nomor Rekap sudah dipakai. Buka dokumen tersimpan untuk mengeditnya.'],
      missing: [404, 'Rekap yang diedit tidak ditemukan.'],
      stale: [409, 'Rekap sudah diubah sejak dibuka. Muat ulang dokumen sebelum menyimpan.'],
      sourceMissing: [404, 'PPU asal tidak ditemukan.'],
      sourceChanged: [409, 'PPU asal Rekap ini sudah ditetapkan.'],
      sourceTaken: [409, 'PPU ini sudah terhubung dengan Rekap lain.']
    };
    if (status !== 'ok') {
      const [code, message] = errors[status] || [500, 'Gagal menyimpan Rekap.'];
      return response.status(code).json({ success: false, message });
    }
    return response.status(200).json({ success: true, savedAt, revision: nextRevision });
  } catch (error) {
    console.error('Error saat menyimpan Rekap:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}

// Simpan dokumen dan tautan PPU dalam satu operasi agar dua permintaan tidak bisa memakai PPU yang sama.
const SAVE_REKAP = `
local raw = redis.call('GET', KEYS[1])
local source = ARGV[2]
if ARGV[1] == 'create' and raw then return 'duplicate' end
if ARGV[1] == 'edit' then
  if not raw then return 'missing' end
  local existing = cjson.decode(raw)
  local revision = existing.revision or existing.savedAt
  if revision == cjson.null then revision = nil end
  if (revision or '') ~= ARGV[4] or (existing.order or cjson.null) ~= cjson.decode(ARGV[6]) then return 'stale' end
  local oldSource = existing.projectInfo.sourcePpuNumber
  if oldSource and oldSource ~= '' and oldSource ~= source then return 'sourceChanged' end
  if oldSource ~= source and source ~= '' and redis.call('EXISTS', KEYS[2]) == 0 then return 'sourceMissing' end
end
if source ~= '' then
  if ARGV[1] == 'create' and redis.call('EXISTS', KEYS[2]) == 0 then return 'sourceMissing' end
  local linked = redis.call('GET', KEYS[3])
  if linked and linked ~= ARGV[3] then return 'sourceTaken' end
  redis.call('SET', KEYS[3], ARGV[3])
end
redis.call('SET', KEYS[1], ARGV[5])
return 'ok'
`;
