const nodemailer = require('nodemailer');

const sendMailTo = async(recip, subject, body) =>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.ZEIT_EMAIL,
          pass: process.env.ZEIT_EMAIL_PASSWORD
        }
      });
      var mailOptions = {
        from: 'Zeit',
        to: recip,
        subject: subject,
        text: body
      };
      
      try {
        const info = await transporter.sendMail(mailOptions);
        return "Email sent!";
      } catch (error) {
        return error;
      }

}

module.exports.sendMailTo = sendMailTo