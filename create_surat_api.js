const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'dashboard-pt-mpg', 'api');

// simpanSurat.js
fs.writeFileSync(path.join(targetDir, 'simpanSurat.js'), `import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ message: 'Metode tidak diizinkan' });

  try {
    const { data, username } = request.body;
    if (!data || !data.nomorSurat || !username) {
      return response.status(400).json({ success: false, message: 'Data tidak lengkap. Username dan Nomor Surat wajib diisi.' });
    }

    data.savedAt = new Date().toISOString();
    const key = \`\${username}-\${data.nomorSurat}\`;
    await kv.set(key, data);
    return response.status(200).json({ success: true, message: 'Data Surat berhasil disimpan.', key: key });
  } catch (error) {
    console.error('Error saat menyimpan Surat:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}`);

// ambilSurat.js
fs.writeFileSync(path.join(targetDir, 'ambilSurat.js'), `import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ message: 'Metode tidak diizinkan' });

  try {
    const { number, username } = request.query;
    if (!number || !username) return response.status(400).json({ success: false, message: 'Nomor Surat dan Username diperlukan.' });

    const key = \`\${username}-\${number}\`;
    const data = await kv.get(key);
    if (!data) return response.status(404).json({ success: false, message: 'Data Surat tidak ditemukan.' });

    return response.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error('Error saat mengambil Surat:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}`);

// hapusSurat.js
fs.writeFileSync(path.join(targetDir, 'hapusSurat.js'), `import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') return response.status(405).json({ message: 'Metode tidak diizinkan' });

  try {
    const { number, username } = request.body;
    if (!number || !username) return response.status(400).json({ success: false, message: 'Nomor Surat dan Username diperlukan.' });

    const key = \`\${username}-\${number}\`;
    const deleted = await kv.del(key);
    if (deleted === 0) return response.status(404).json({ success: false, message: 'Data Surat tidak ditemukan atau sudah dihapus.' });

    return response.status(200).json({ success: true, message: 'Data Surat berhasil dihapus.' });
  } catch (error) {
    console.error('Error saat menghapus Surat:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}`);

// ambilSemuaNomorSurat.js
fs.writeFileSync(path.join(targetDir, 'ambilSemuaNomorSurat.js'), `import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ message: 'Metode tidak diizinkan' });

  try {
    const { username } = request.query;
    if (!username) return response.status(400).json({ success: false, message: 'Username diperlukan.' });

    const keys = [];
    for await (const key of kv.scanIterator({ match: \`\${username}-SURAT-*\` })) {
      keys.push(key);
    }
    return response.status(200).json({ success: true, keys: keys });
  } catch (error) {
    console.error('Error saat mengambil semua kunci Surat:', error);
    return response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
}`);
console.log("Vercel Surat APIs generated!");
