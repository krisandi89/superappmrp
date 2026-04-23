const fs = require('fs');

const path = '\\\\nuclearstorage\\home\\PERSONAL\\FAMILY\\SANDI\\Aplikasi Antigravity\\Super-app-MPG\\dashboard-pt-mpg\\index.html';
let content = fs.readFileSync(path, 'utf8');

// HTML Container Replacements
content = content.replace(
    `<div class="card" style="margin-bottom: 25px; padding: 10px;">
                 <div style="display: flex; justify-content: start; gap: 8px; overflow-x: auto;">
                    <button onclick="changeAppTab('ppu')" id="app-tab-ppu" class="app-tab-button active">
                        <i class="fas fa-file-invoice-dollar"></i> PPU
                    </button>
                    <button onclick="changeAppTab('rekap')" id="app-tab-rekap" class="app-tab-button">
                        <i class="fas fa-chart-pie"></i> Rekapitulasi
                    </button>
                </div>
            </div>
           
            <main>
                <div id="pane-ppu" class="app-pane active"></div>
                <div id="pane-rekap" class="app-pane"></div>
            </main>`,
    `<div class="card" style="margin-bottom: 25px; padding: 10px;">
                 <div id="app-tabs-container" style="display: flex; justify-content: start; gap: 8px; overflow-x: auto;">
                </div>
            </div>
           
            <main id="app-panes-container">
            </main>`
);

// JS changeAppTab Replacement
content = content.replace(
    `function changeAppTab(appName) {
            ['ppu', 'rekap'].forEach(tab => {
                document.getElementById(\`app-tab-\${tab}\`)?.classList.remove('active');
                document.getElementById(\`pane-\${tab}\`)?.classList.remove('active');
            });
            document.getElementById(\`app-tab-\${appName}\`)?.classList.add('active');
            document.getElementById(\`pane-\${appName}\`)?.classList.add('active');
        }`,
    `function changeAppTab(appName) {
            window.APP_MODULES.forEach(mod => {
                const tab = mod.id;
                document.getElementById(\`app-tab-\${tab}\`)?.classList.remove('active');
                document.getElementById(\`pane-\${tab}\`)?.classList.remove('active');
            });
            document.getElementById(\`app-tab-\${appName}\`)?.classList.add('active');
            document.getElementById(\`pane-\${appName}\`)?.classList.add('active');
        }`
);

// Initialization Template Replacements
content = content.replace(
    "document.getElementById('pane-ppu').innerHTML =",
    `window.APP_MODULES = [
                { id: 'ppu', name: 'PPU', icon: 'fa-file-invoice-dollar', templateFn: () => window.getTemplatePpu(), initFn: () => window.initPPUApp() },
                { id: 'rekap', name: 'Rekapitulasi', icon: 'fa-chart-pie', templateFn: () => window.getTemplateRekap(), initFn: () => window.initRekapApp() }
            ];

            window.getTemplatePpu = () =>`
);

content = content.replace(
    "document.getElementById('pane-rekap').innerHTML =",
    "window.getTemplateRekap = () =>"
);

const initReplacement = `await fetchHolidays();

            const tabsContainer = document.getElementById('app-tabs-container');
            const panesContainer = document.getElementById('app-panes-container');
            
            if (tabsContainer && panesContainer) {
                tabsContainer.innerHTML = '';
                panesContainer.innerHTML = '';
                window.APP_MODULES.forEach((mod, index) => {
                    const isActive = index === 0 ? 'active' : '';
                    tabsContainer.innerHTML += \`<button onclick="changeAppTab('\${mod.id}')" id="app-tab-\${mod.id}" class="app-tab-button \${isActive}">
                        <i class="fas \${mod.icon}"></i> \${mod.name}
                    </button>\`;
                    panesContainer.innerHTML += \`<div id="pane-\${mod.id}" class="app-pane \${isActive}">\${mod.templateFn()}</div>\`;
                });
            }

            window.APP_MODULES.forEach(mod => {
                if(mod.initFn) mod.initFn();
            });`;

content = content.replace(
    /await fetchHolidays\(\);\s*initPPUApp\(\);\s*initRekapApp\(\);/,
    initReplacement
);

// Global attach
content = content.replace("function initPPUApp() {", "window.initPPUApp = function initPPUApp() {");
content = content.replace("function initRekapApp() {", "window.initRekapApp = function initRekapApp() {");

fs.writeFileSync(path, content, 'utf8');
console.log("Mutation completed!");
