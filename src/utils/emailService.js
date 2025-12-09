const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Transporter Ayarları (Port 465 - SSL)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // 587 yerine 465 kullanıyoruz
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      // Bazı sunucularda sertifika sorunlarını aşmak için
      rejectUnauthorized: false
    },
    // Zaman aşımı sürelerini biraz daha artıralım (20sn)
    connectionTimeout: 20000, 
    greetingTimeout: 20000,
    socketTimeout: 20000
  });

  // 2. Mesaj İçeriği
  const formattedMessage = options.message ? options.message.replace(/\n/g, '<br>') : '';

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Akıllı Kampüs</h2>
            <div style="border-left: 4px solid #1976d2; padding-left: 15px; margin: 20px 0;">
              <p>${formattedMessage}</p>
            </div>
            <p style="font-size: 12px; color: #888;">Bu mesaj otomatik olarak gönderilmiştir.</p>
           </div>`
  };

  // 3. Gönderim
  try {
    console.log(`⏳ E-posta gönderiliyor: ${options.email}`);
    const info = await transporter.sendMail(message);
    console.log(`✅ E-posta başarıyla gönderildi! ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ E-posta Hatası:', error.message);
    throw new Error(`E-posta servisine bağlanılamadı: ${error.message}`);
  }
};

module.exports = sendEmail;