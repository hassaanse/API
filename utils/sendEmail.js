const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your preferred email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });

  await transporter.sendMail({
    from: '"TheKoi, your future" , Customer support email: hassaanse@gmail.com',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
