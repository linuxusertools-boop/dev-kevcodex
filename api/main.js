import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { feature } = req.query;
    const pluginsDir = path.join(process.cwd(), 'plugins');

    console.log("Mencari plugin di:", pluginsDir); // Cek di Logs Vercel

    try {
        if (!feature) {
            const pluginFiles = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
            const data = await Promise.all(pluginFiles.map(async (file) => {
                const { config } = await import(`../plugins/${file}`);
                return { id: file.replace('.js', ''), ...config };
            }));
            return res.status(200).json(data);
        }

        // Paksa ke lowercase agar tidak ada salah ketik
        const target = feature.toLowerCase();
        const filePath = path.join(pluginsDir, `${target}.js`);

        console.log("Target file:", filePath);

        if (fs.existsSync(filePath)) {
            const plugin = await import(`../plugins/${target}.js`);
            return await plugin.default(req, res);
        } else {
            return res.status(404).json({ 
                status: false, 
                message: `File plugins/${target}.js tidak ada.` 
            });
        }
    } catch (error) {
        console.error("ERROR UTAMA:", error.message);
        return res.status(500).json({ 
            status: false, 
            error: error.message 
        });
    }
}
