const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/channel-info', async (req, res) => {
    const { link } = req.query;

    if (!link || !link.includes('whatsapp.com/channel/')) {
        return res.status(400).json({ status: 400, message: '❌ يرجى إدخال رابط قناة صحيح.' });
    }

    try {
        const { data } = await axios.get(link, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'ar,en;q=0.9' }
        });

        const $ = cheerio.load(data);
        const title = $('meta[property="og:title"]').attr('content') || 'غير معروف';
        const image = $('meta[property="og:image"]').attr('content') || '';
        const description = $('meta[property="og:description"]').attr('content') || 'لا يوجد وصف';
        const inviteId = link.split('/channel/')[1];

        res.json({
            status: 200,
            id: inviteId,
            name: title,
            description,
            image,
            link
        });
    } catch (error) {
        console.error('❌ خطأ أثناء الجلب:', error.message);
        return res.status(500).json({ status: 500, message: '❌ تعذر جلب بيانات القناة.' });
    }
});

app.listen(PORT, () => console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`));
