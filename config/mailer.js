// NODEMAILER TRANSPORTER
var nodemailer = require('nodemailer');

module.exports = () => {
    // TRANSPORTER CONFIG
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'buscarfloripa',
            pass: 'buscar123'
        }
    });

    return transporter;
};