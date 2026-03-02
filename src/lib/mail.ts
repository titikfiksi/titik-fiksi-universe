import nodemailer from "nodemailer";

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
  try {
    // PERBAIKAN TAHAP 1: Menghapus fallback "smtp.gmail.com" dan port default
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, 
      port: Number(process.env.SMTP_PORT),
      secure: true, 
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      // Menggunakan variabel lingkungan untuk alamat pengirim
      from: `"Titik Fiksi Universe" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email berhasil dikirim: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return { success: false, error };
  }
};