import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { feature } = req.query;
    const pluginsDir = path.join(process.cwd(), 'plugins');

    try {
        if (!feature) {
            if (!fs.existsSync(pluginsDir)) return res.status(200).json([]);
            const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
            const data = await Promise.all(pluginFiles.map(async (file) => {
                // Gunakan path absolut untuk import
                const pluginPath = path.join(process.cwd(), 'plugins', file);
                const { config } = await import(`file://${pluginPath}`);
                return { id: file.replace('.js', ''), ...config };
            }));
            return res.status(200).json(data);
        }

        const target = feature.toLowerCase().split('?')[0].replace(/[^a-z0-9-]/g, '');
        const filePath = path.join(pluginsDir, `${target}.js`);

        if (fs.existsSync(filePath)) {
            // Tambahkan file:// untuk kompatibilitas ESM di Linux/Vercel
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
