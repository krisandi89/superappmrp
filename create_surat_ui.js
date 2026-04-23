const fs = require('fs');
const path = require('path');

const targetHtml = path.join(__dirname, '..', 'dashboard-pt-mpg', 'index.html');
let content = fs.readFileSync(targetHtml, 'utf8');

// Inject Surat to APP_MODULES
content = content.replace(
    /\s*\{\s*id:\s*'rekap',\s*name:\s*'Rekapitulasi',\s*icon:\s*'fa-chart-pie',\s*templateFn:\s*\(\)\s*=>\s*window\.getTemplateRekap\(\),\s*initFn:\s*\(\)\s*=>\s*window\.initRekapApp\(\)\s*\}/g,
    `{ id: 'rekap', name: 'Rekapitulasi', icon: 'fa-chart-pie', templateFn: () => window.getTemplateRekap(), initFn: () => window.initRekapApp() },
                { id: 'surat', name: 'Database Surat', icon: 'fa-envelope-open-text', templateFn: () => window.getTemplateSurat(), initFn: () => window.initSuratApp() }`
);

// Inject Surat Template and Logic at the end of the file
const suratLogic = `
        window.getTemplateSurat = () => \`
<div style="display: flex; flex-direction: column; gap: 25px;">
    <div class="card">
        <h2 style="font-size: 1.25rem; font-weight: 600; color: #343a40; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e9ecef;">Pembuatan Nomor Surat Baru</h2>
        <form id="surat-form">
            <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 1rem; md:grid-template-columns: repeat(2, 1fr);">
                <div>
                    <label for="surat-type" class="block text-sm font-medium text-gray-600 mb-1">Tipe Surat</label>
                    <select id="surat-type" class="form-select" required>
                        <option value="">-- Pilih --</option>
                        <option value="PENAWARAN">Penawaran</option>
                        <option value="INVOICE">Invoice</option>
                        <option value="KONTRAK">Kontrak</option>
                        <option value="PPU">PPU</option>
                        <option value="UMUM">Umum</option>
                    </select>
                </div>
                <div>
                    <label for="surat-date" class="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
                    <input type="text" id="surat-date" class="form-input" placeholder="dd/mm/yyyy" required>
                </div>
                <div>
                    <label for="surat-perihal" class="block text-sm font-medium text-gray-600 mb-1">Perihal</label>
                    <input type="text" id="surat-perihal" class="form-input" required>
                </div>
                <div>
                    <label for="surat-tujuan" class="block text-sm font-medium text-gray-600 mb-1">Tujuan / Kepada</label>
                    <input type="text" id="surat-tujuan" class="form-input" required>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                <p style="font-size: 14px; color: var(--gray); margin-bottom: 5px;">Preview Nomor Surat Otomatis</p>
                <h3 id="surat-preview-number" style="color: var(--primary); font-weight: bold; font-size: 20px;">[001]/MPG/[TIPE]/[BULAN]/[TAHUN]</h3>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 1.5rem;">
                <button type="submit" id="surat-save-btn" class="btn btn-primary"><i class="fas fa-save"></i> Buat & Simpan Nomor</button>
            </div>
        </form>
    </div>

    <div class="card">
        <h2 style="font-size: 1.25rem; font-weight: 600; color: #343a40; margin-bottom: 1.5rem;">Daftar Surat Tersimpan</h2>
        <div style="margin-bottom: 15px;">
            <input type="text" id="surat-list-search" class="form-input" placeholder="Cari berdasarkan nomor, perihal, atau tujuan...">
        </div>
        <div style="overflow-x: auto;">
            <table style="width: 100%; text-align: left;">
                <thead style="background-color: #f8f9fa;">
                    <tr>
                        <th style="padding: 12px; font-size: 14px; font-weight: 600;">Nomor Surat</th>
                        <th style="padding: 12px; font-size: 14px; font-weight: 600;">Tanggal</th>
                        <th style="padding: 12px; font-size: 14px; font-weight: 600;">Perihal</th>
                        <th style="padding: 12px; font-size: 14px; font-weight: 600;">Tujuan</th>
                        <th style="padding: 12px; font-size: 14px; font-weight: 600; text-align: center;">Aksi</th>
                    </tr>
                </thead>
                <tbody id="surat-table-body">
                </tbody>
            </table>
            <p id="surat-no-data-message" style="text-align: center; color: var(--gray); padding: 32px 0;">Memuat data surat...</p>
        </div>
    </div>
</div>\`;

        window.initSuratApp = function() {
            const dateInput = document.getElementById('surat-date');
            const typeInput = document.getElementById('surat-type');
            const previewEl = document.getElementById('surat-preview-number');
            const formObj = document.getElementById('surat-form');
            const searchInput = document.getElementById('surat-list-search');
            
            flatpickr(dateInput, { dateFormat: "d/m/Y", locale: "id", defaultDate: "today" });
            
            let allSuratData = [];

            const getRomawiBulan = (monthNum) => {
                const romawi = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
                return romawi[monthNum] || "";
            };

            const updatePreview = () => {
                const type = typeInput.value || 'TIPE';
                const ds = dateInput.value;
                let monthStr = 'BULAN';
                let yearStr = 'TAHUN';
                
                if (ds && /\\d{2}\\/\\d{2}\\/\\d{4}/.test(ds)) {
                    const [ , m, y ] = ds.split('/');
                    monthStr = getRomawiBulan(parseInt(m, 10));
                    yearStr = y;
                }
                
                // Urutkan nomor berdasarkan tahun, ambil auto increment
                const countThisYear = allSuratData.filter(d => String(d.nomorSurat).includes('/' + yearStr)).length;
                const nextNum = String(countThisYear + 1).padStart(3, '0');

                previewEl.textContent = \`\${nextNum}/MPG/\${type}/\${monthStr}/\${yearStr}\`;
            };

            typeInput.addEventListener('change', updatePreview);
            dateInput.addEventListener('change', updatePreview);

            const renderTable = (filter = '') => {
                const tbody = document.getElementById('surat-table-body');
                tbody.innerHTML = '';
                const emptyMsg = document.getElementById('surat-no-data-message');
                
                const searchTerm = filter.toLowerCase();
                const filtered = allSuratData.filter(d => 
                    d.nomorSurat.toLowerCase().includes(searchTerm) || 
                    d.perihal.toLowerCase().includes(searchTerm) || 
                    d.tujuan.toLowerCase().includes(searchTerm)
                );

                if (filtered.length === 0) {
                    emptyMsg.textContent = 'Tidak ada entri surat ditemukan.';
                    emptyMsg.style.display = 'block';
                } else {
                    emptyMsg.style.display = 'none';
                    filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(s => {
                        const row = tbody.insertRow();
                        row.style.borderBottom = '1px solid #e9ecef';
                        row.innerHTML = \`
                            <td style="padding: 12px; font-weight: 600; color: var(--dark);">\${s.nomorSurat}</td>
                            <td style="padding: 12px;">\${s.date}</td>
                            <td style="padding: 12px;">\${s.perihal}</td>
                            <td style="padding: 12px;">\${s.tujuan}</td>
                            <td style="padding: 12px; text-align: center;">
                                <button onclick="window.deleteSurat('\${s.nomorSurat}')" title="Hapus" style="color: var(--danger); background: none; border: none; cursor: pointer;"><i class="fas fa-trash-alt"></i></button>
                            </td>
                        \`;
                    });
                }
            };
            
            searchInput.addEventListener('input', (e) => renderTable(e.target.value));

            const fetchAllSurat = async () => {
                const username = localStorage.getItem('loggedInUser');
                if(!username) return;
                try {
                    const res = await fetch(\`/api/ambilSemuaNomorSurat?username=\${username}\`);
                    const json = await res.json();
                    if(json.success && json.keys) {
                        const promises = json.keys.map(k => fetch(\`/api/ambilSurat?number=\${encodeURIComponent(k.replace(\`\${username}-\`, ''))}&username=\${username}\`).then(r => r.json()));
                        const allResults = await Promise.all(promises);
                        allSuratData = allResults.map(r => r.data).filter(Boolean);
                    }
                    renderTable();
                    updatePreview();
                } catch(e) {
                    console.error('Fetch surat error', e);
                }
            };

            window.deleteSurat = (nomorSurat) => {
                showModal('Konfirmasi Hapus', \`Hapus Surat \${nomorSurat}?\`, 'confirm', async () => {
                    try {
                        const res = await fetch('/api/hapusSurat', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: localStorage.getItem('loggedInUser'), number: \`SURAT-\${nomorSurat}\` }) // Key prepend SURAT to avoid collision? Wait, we can just save it as SURAT-xxx
                        });
                        if (res.ok) {
                            showNotification('Surat dihapus.', 'success');
                            fetchAllSurat();
                        }
                    } catch(e) {
                        showNotification('Gagal hapus surat', 'error');
                    }
                });
            };

            formObj.addEventListener('submit', async (e) => {
                e.preventDefault();
                updatePreview();
                const genNomor = previewEl.textContent;
                
                const data = {
                    nomorSurat: \`SURAT-\${genNomor}\`,
                    date: dateInput.value,
                    perihal: document.getElementById('surat-perihal').value,
                    tujuan: document.getElementById('surat-tujuan').value,
                    type: typeInput.value,
                    createdAt: new Date().toISOString()
                };

                const btn = document.getElementById('surat-save-btn');
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
                
                try {
                    const res = await fetch('/api/simpanSurat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: localStorage.getItem('loggedInUser'), data })
                    });
                    
                    if (res.ok) {
                        showNotification('Nomor surat berhasil dibuat!', 'success');
                        formObj.reset();
                        flatpickr(dateInput, { dateFormat: "d/m/Y", locale: "id", defaultDate: "today" });
                        fetchAllSurat();
                    } else {
                        showNotification('Gagal menyimpan nomor surat', 'error');
                    }
                } catch(err) {
                    showNotification('Error menyimpan surat', 'error');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-save"></i> Buat & Simpan Nomor';
                }
            });

            fetchAllSurat();
        };
</script>
</body>
</html>`;

content = content.replace(/<\/script>\s*<\/body>\s*<\/html>/g, suratLogic);

fs.writeFileSync(targetHtml, content, 'utf8');
console.log("Surat UI injected!");
