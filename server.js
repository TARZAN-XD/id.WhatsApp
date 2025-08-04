const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const qrcode = require('qrcode');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 📂 مجلد لتخزين الجلسة
const SESSION_DIR = path.join(__dirname, 'session');
fs.mkdirSync(SESSION_DIR, { recursive: true });

// 📂 مجلد public للواجهة
app.use(express.static(path.join(__dirname, 'public')));

// ✅ عند فتح السيرفر
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let sock;

// ✅ تشغيل واتساب
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  // ✅ عند ظهور QR
  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;

    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      io.emit('qr', qrImage);
    }

    if (connection === 'open') {
      console.log('✅ تم الاتصال بنجاح');
      io.emit('connected'); // 🔹 إشعار الواجهة أن الاتصال تم
      await loadChats();
    }
  });

  // ✅ استقبال الرسائل الجديدة
  sock.ev.on('messages.upsert', async ({ messages }) => {
    console.log('📩 رسالة جديدة:', messages[0]?.message?.conversation);
  });
}

// ✅ تحميل المحادثات بعد الاتصال
async function loadChats() {
  try {
    const chats = await sock.store?.chats || [];
    const formattedChats = chats.map(c => ({
      id: c.id,
      name: c.name || c.id
    }));
    io.emit('chats', formattedChats);
  } catch (err) {
    console.error('❌ خطأ أثناء تحميل المحادثات:', err.message);
  }
}

// ✅ جلب الرسائل عند اختيار المحادثة
io.on('connection', (socket) => {
  socket.on('getMessages', async (jid) => {
    try {
      const messages = await sock.fetchMessagesFromWA(jid, 20); // آخر 20 رسالة
      socket.emit('messages', { jid, messages });
    } catch (err) {
      console.error('❌ خطأ في جلب الرسائل:', err.message);
    }
  });
});

// ✅ بدء السيرفر
server.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
  startBot();
});
