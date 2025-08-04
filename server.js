const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));

// ✅ إنشاء store لحفظ الرسائل والمحادثات
const store = makeInMemoryStore({});

// ✅ تهيئة واتساب
let sock;

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('sessions');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: true
    });

    store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, qr } = update;
        if (qr) {
            const qrImage = await qrcode.toDataURL(qr);
            io.emit('qr', qrImage);
        }
        if (connection === 'open') {
            console.log('✅ واتساب متصل');
            io.emit('ready');
        }
    });
}

startWhatsApp();

// ✅ API لجلب المحادثات
app.get('/api/chats', (req, res) => {
    const chats = store.chats.all();
    res.json(chats);
});

// ✅ API لجلب الرسائل لمحادثة معينة
app.get('/api/messages/:jid', (req, res) => {
    const jid = req.params.jid;
    const messages = store.messages[jid]?.array || [];
    res.json(messages);
});

server.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
