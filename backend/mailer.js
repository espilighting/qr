const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'incidenciasonidoalmendralejo@gmail.com',
    pass: 'TAlmendralejo-4090' // Usa una App Password si tienes verificación en 2 pasos
  }
});

const sendIncidenciaEmail = async ({ titulo, descripcion, registrado_por, codigo_qr }) => {
  const mailOptions = {
    from: 'TU_CORREO@gmail.com',
    to: 'DESTINATARIO@ejemplo.com',
    subject: `🚨 Incidencia reportada: ${titulo}`,
    text: `Se ha registrado una nueva incidencia:

🔧 Código QR: ${codigo_qr}
📝 Título: ${titulo}
📄 Descripción: ${descripcion}
👤 Registrado por: ${registrado_por}`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendIncidenciaEmail;
