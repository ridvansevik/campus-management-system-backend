const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Transporter'ı oluştur (SMTP Ayarları .env'den gelecek)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,      // Örn: smtp-relay.brevo.com
    port: process.env.SMTP_PORT,      // Örn: 587
    secure: false,                    // 587 için false, 465 için true
    auth: {
      user: process.env.SMTP_EMAIL,   // Kullanıcı adı
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false       // Bazı sunucu sertifika hatalarını görmezden gel
    }
  });

  // 2. Gönderilecek mesajı hazırla
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Kimden
    to: options.email,                                             // Kime
    subject: options.subject,                                      // Konu
    text: options.message,                                         // Mesaj içeriği (Düz metin)
    // html: options.html                                          // İsterseniz HTML de ekleyebilirsiniz
  };

  // 3. Gönder
  try {
    const info = await transporter.sendMail(message);
    console.log('✅ E-posta başarıyla gönderildi. ID:', info.messageId);
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error);
    // Hata olsa bile uygulamayı çökertmemek için throw yapmayabiliriz
    // veya hatayı yukarı fırlatıp controller'da yakalayabiliriz.
  }
};

module.exports = sendEmail;