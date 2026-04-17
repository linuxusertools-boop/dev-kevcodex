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
