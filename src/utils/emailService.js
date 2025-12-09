const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Transporter'ı Ayarla (.env'den bilgileri çeker)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail için özel servis ayarı (Host/Port yerine bunu kullanmak daha garantidir)
    auth: {
      user: process.env.SMTP_EMAIL, // .env'deki Gmail adresiniz
      pass: process.env.SMTP_PASSWORD, // .env'deki 16 haneli Uygulama Şifresi
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // 2. Mail İçeriği
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Gönder
  const info = await transporter.sendMail(message);

  console.log(`✅ E-posta başarıyla gönderildi! ID: ${info.messageId}`);
};

module.exports = sendEmail;