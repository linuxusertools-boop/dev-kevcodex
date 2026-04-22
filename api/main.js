import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Tambahkan Header CORS agar Frontend bisa mengakses API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { feature } = req.query;
    const pluginsDir = path.join(process.cwd(), 'plugins');

    try {
        if (!feature) {
            // Cek apakah folder plugins ada
            if (!fs.existsSync(pluginsDir)) return res.status(200).json([]);
            
            const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
            const data = await Promise.all(pluginFiles.map(async (file) => {
                const pluginPath = path.join(process.cwd(), 'plugins', file);
                // Tambahkan file:// untuk kompatibilitas Linux/Vercel ESM
                const { config } = await import(`file://${pluginPath}`);
                return { id: file.replace('.js', ''), ...config };
            }));
            return res.status(200).json(data);
        }

        // Logika eksekusi fitur (seperti fakedana atau cek-otp)
        const target = feature.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const filePath = path.join(pluginsDir, `${target}.js`);

        if (fs.existsSync(filePath)) {
            const pluginPath = path.join(process.cwd(), 'plugins', `${target}.js`);
            const plugin = await import(`file://${pluginPath}`);
            if (typeof plugin.default === 'function') {
                return await plugin.default(req, res);
            }
        } 
        return res.status(404).json({ status: false, message: `Feature ${target} not found.` });
    } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
    }
}
