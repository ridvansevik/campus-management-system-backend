const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    // Resend üzerinden mail gönder
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev', 
      to: options.email,
      subject: options.subject,
      text: options.message,
    });

    if (error) {
      console.error('❌ Resend Hatası:', error);
      throw new Error(error.message);
    }

    console.log(`✅ E-posta başarıyla gönderildi! ID: ${data.id}`);
    return data;

  } catch (err) {
    console.error('❌ E-posta gönderilemedi:', err);
    // Hatayı fırlat ki çağıran fonksiyon (authController) haberdar olsun
    throw err; 
  }
};

module.exports = sendEmail;