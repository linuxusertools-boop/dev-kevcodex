import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Tentukan path folder plugins secara absolut
    const pluginsDir = path.join(process.cwd(), 'plugins');
    const { feature } = req.query;

    try {
        // 1. Logika untuk UI (ambil daftar semua plugin)
        if (!feature) {
            const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
            const data = await Promise.all(pluginFiles.map(async (file) => {
                const { config } = await import(`../plugins/${file}`);
                return { id: file.replace('.js', ''), ...config };
            }));
            return res.status(200).json(data);
        }

        // 2. Logika menjalankan fitur spesifik
        const filePath = path.join(pluginsDir, `${feature}.js`);
        
        if (fs.existsSync(filePath)) {
            // Gunakan path relatif untuk import di Vercel
            const plugin = await import(`../plugins/${feature}.js`);
            return await plugin.default(req, res);
        } else {
            return res.status(404).json({ 
                status: false, 
                message: `Fitur '${feature}' tidak ditemukan di folder plugins.` 
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            status: false, 
            error: "Internal Server Error",
            details: error.message 
        });
    }
}
