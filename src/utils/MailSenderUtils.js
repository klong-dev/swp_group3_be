const { text } = require("express");
const { sendMail } = require("../config/mail/mail")
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const invite_group = async (from, to, bookingId, memberId) => {
    let htmlTemplate = fs.readFileSync(path.join(__dirname, '../mail_template/invite_group.html'), 'utf-8');
    htmlTemplate = htmlTemplate.replace('{{leader_mail}}', from); 
    htmlTemplate = htmlTemplate.replace('{{reject_link}}', `${process.env.CLIENT_URL}/process-accept/reject/${bookingId}/${memberId}`);
    htmlTemplate = htmlTemplate.replace('{{accept_link}}', `${process.env.CLIENT_URL}/process-accept/accept/${bookingId}/${memberId}`);

    await sendMail(
        to,
        "Invitation to join group",
        "",
        htmlTemplate
    );
}

module.exports = { invite_group };