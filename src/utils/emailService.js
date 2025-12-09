const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Transporter Ayarları (Daha kararlı ayarlar)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // 465 yerine 587 kullanıyoruz (Daha güvenilir)
    secure: false, // 587 için false olmalı
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    // Bağlantı takılırsa sonsuza kadar beklemesin, 10 saniyede pes etsin
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000
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
    const info = await transporter.sendMail(message);
    console.log(`✅ E-posta gönderildi: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ E-posta Hatası:', error.message);
    // Hata detayını fırlat ki controller yakalasın ve rollback yapsın
    throw new Error(`E-posta sunucusuna bağlanılamadı: ${error.message}`);
  }
};

module.exports = sendEmail;