const { sendMail } = require('../../config/mail/mail')
class MailController {
  async sendMail(req, res) {
    try {
      const { to, subject, text, html } = req.body;
      console.log(to , subject, text, html) 
      await sendMail(to, subject, text, html);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
}
module.exports = new MailController()