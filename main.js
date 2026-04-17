import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { feature } = req.query;
    const pluginsDir = path.join(process.cwd(), 'plugins');

    // Endpoint untuk mendapatkan daftar semua plugin (untuk UI)
    if (req.method === 'GET' && !feature) {
        try {
            const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
            const loadedPlugins = await Promise.all(pluginFiles.map(async (file) => {
                const fileName = file.replace('.js', '');
                const pluginPath = path.join(process.cwd(), 'plugins', file);
                const { config } = await import(`file://${pluginPath}`);
                return { id: fileName, ...config };
            }));
            return res.status(200).json(loadedPlugins);
        } catch (e) {
            return res.status(500).json({ error: "Gagal memuat daftar plugin" });
        }
    }

    // Endpoint untuk menjalankan fitur spesifik
    if (feature) {
        try {
            const pluginPath = path.join(process.cwd(), 'plugins', `${feature}.js`);
            const plugin = await import(`file://${pluginPath}`);
            return plugin.default(req, res);
        } catch (e) {
            return res.status(404).json({ status: false, message: "Fitur tidak ditemukan" });
        }
    }
}
        code:hover { background: var(--primary); color: white; }
        footer { text-align: center; padding: 60px 0; color: var(--text-sub); font-size: 0.85rem; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="header-banner"></div>
    <nav><div class="logo">KEV.SOFT</div><div style="font-size:0.8rem;font-weight:600">Scyllora V9</div></nav>
    <div class="main-container">
        <section class="soft-card">
            <h1>dev-kevcodex api</h1>
            <p style="color:var(--text-sub)">Ditemukan <b>${loadedPlugins.length}</b> fitur aktif dalam sistem.</p>
        </section>
        <section class="soft-card">
            <h2>API Documentation</h2>
            ${listHtml}
        </section>
        <footer>&copy; 2026 KEV.SOFT | powered by kevcodex.</footer>
    </div>
</body>
</html>
    `);
}
