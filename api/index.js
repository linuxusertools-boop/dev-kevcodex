import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { feature } = req.query;
    const pluginsDir = path.join(process.cwd(), 'plugins');

    // Ambil semua file .js di folder plugins
    const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));

    // --- LOGIKA MENJALANKAN PLUGIN ---
    if (feature) {
        try {
            const pluginPath = path.join(process.cwd(), 'plugins', `${feature}.js`);
            const plugin = await import(`file://${pluginPath}`);
            return plugin.default(req, res);
        } catch (e) {
            return res.status(404).json({ 
                status: false, 
                message: `Fitur '${feature}' tidak ditemukan atau terjadi error internal.` 
            });
        }
    }

    // --- LOGIKA GENERATE DOKUMENTASI DINAMIS ---
    let listHtml = "";
    const categories = {};

    // Baca metadata tiap plugin secara asinkron
    const pluginPromises = pluginFiles.map(async (file) => {
        const fileName = file.replace('.js', '');
        const pluginPath = path.join(process.cwd(), 'plugins', file);
        const { config } = await import(`file://${pluginPath}`);
        return { fileName, config };
    });

    const loadedPlugins = await Promise.all(pluginPromises);

    // Kelompokkan berdasarkan kategori
    loadedPlugins.forEach(({ fileName, config }) => {
        const cat = config.category || "Uncategorized";
        if (!categories[cat]) categories[cat] = "";
        
        categories[cat] += `
            <div class="api-item">
                <div class="api-info">
                    <span>${config.name}</span>
                    <small>${config.description}</small>
                </div>
                <code onclick="window.open('/api?feature=${fileName}', '_blank')" style="cursor:pointer">
                    /api?feature=${fileName}
                </code>
            </div>`;
    });

    for (const [cat, items] of Object.entries(categories)) {
        listHtml += `<div class="category-title">${cat}</div>${items}`;
    }

    // --- RENDER HTML SCYLLORA V9 ---
    res.setHeader('Content-Type', 'text/html');
    res.send(`
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>kevcodex | Full API Docs</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4361ee; --primary-light: #eef2ff; --bg: #f8fafc;
            --card-bg: #ffffff; --text-main: #1e293b; --text-sub: #64748b; --border: #f1f5f9;
        }
        * { box-sizing: border-box; transition: all 0.3s ease; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; background-color: var(--bg); color: var(--text-main); }
        .header-banner { position: relative; width: 100%; height: 250px; background: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhDTQuoLCb2VIzmEA3INcal_wyOD83Onnx2jXabpox3QlJrQCanVOlZBbk&s=10') center/cover no-repeat; }
        .header-banner::after { content: ''; position: absolute; bottom: 0; width: 100%; height: 60%; background: linear-gradient(to top, var(--bg), transparent); }
        nav { position: sticky; top: 20px; margin: -40px auto 30px; width: 90%; max-width: 500px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(15px); padding: 12px 25px; border-radius: 50px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); z-index: 100; border: 1px solid var(--card-bg); }
        .logo { font-weight: 800; color: var(--primary); font-size: 1rem; }
        .main-container { max-width: 850px; margin: 0 auto; padding: 0 20px; animation: fadeIn 0.8s ease-out; }
        .soft-card { background: var(--card-bg); border-radius: 24px; padding: 35px; margin-bottom: 30px; border: 1px solid var(--border); }
        h1 { font-size: 2.5rem; letter-spacing: -1.5px; margin: 0; }
        h2 { font-size: 1.5rem; color: var(--primary); margin-bottom: 20px; border-left: 4px solid var(--primary); padding-left: 15px; }
        .category-title { font-size: 0.9rem; font-weight: 800; color: var(--text-sub); text-transform: uppercase; margin: 30px 0 10px; letter-spacing: 1px; }
        .api-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--border); }
        .api-info span { font-weight: 600; display: block; }
        .api-info small { color: var(--text-sub); font-size: 0.8rem; }
        code { font-family: monospace; background: var(--primary-light); padding: 6px 12px; border-radius: 10px; font-size: 0.75rem; color: var(--primary); font-weight: 700; }
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
