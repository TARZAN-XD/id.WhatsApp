const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const qrcode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

let sock;
let chats = [];

app.use(express.static('public'));

// عند الاتصال عبر Socket.io
io.on('connection', (socket) => {
  console.log('✅ متصل بالواجهة');

  // إرسال المحادثات للواجهة
  socket.emit('chats', chats);

  // عند اختيار محادثة لعرض الرسائل
  socket.on('getMessages', async (jid) => {
    if (!sock) return;
    try {
      const messages = await sock.loadMessages(jid, 20);
      socket.emit('messages', { jid, messages });
    } catch (e) {
      console.error('❌ خطأ في جلب الرسائل:', e.message);
    }
  });
});

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({ auth: state, printQRInTerminal: false, version });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;
    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      io.emit('qr', qrImage);
    }
    if (connection === 'open') {
      console.log('✅ تم الاتصال بنجاح');
      await loadChats();
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', (m) => {
    console.log('📩 رسالة جديدة:', m.messages[0]?.key.remoteJid);
  });
}

async function loadChats() {
  const allChats = await sock.chats.all();
  chats = allChats.map(c => ({ id: c.id, name: c.name || c.id }));
  io.emit('chats', chats);
}

connectToWhatsApp();

server.listen(PORT, () => console.log(`🚀 السيرفر يعمل على http://localhost:${PORT}`));
