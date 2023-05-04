const nodemailer = require("nodemailer");

async function nodeMailerConfig(){
    
    // testing mail account for send mail
    // let testAccount = await nodemailer.createTestAccount();
    // console.log("created testAccount =>", testAccount);
    
    // create transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'mycircle702@gmail.com', // sender email
          pass: 'itnhckkmotcqiuia', // send email password (token)
        },
    });
    console.log("transporter =>", transporter);

    /**
     * function for send mail
     * @param {Object} details : it's contain users Email Id, subject, plain text, html body
     */
    // async function sendMail(details) {
    //   let info = await transporter.sendMail({
    //     from: 'gaurav.d@webcodegenie.com', // sender address
    //     to: details.userEmail, // list of receivers
    //     subject: details.subject, // Subject line
    //     text: details.text, // plain text body
    //     html: details.html, // html body
    //   });
    // }

    let mailObj = {
        from: 'mycircle702@gmail.com', // sender address
        to: 'dhandhukiya218@gmail.com', // list of receivers
        subject: "My circle Registration", // Subject line
        text: "Register successfully", // plain text body
        html: "<b>Hello world?</b>", // html body
    };

    let info = await transporter.sendMail(mailObj, function(err,result){
        if (err) {
            console.log(err)
        } else {
            console.log(result);
        }
    });

    

    // console.log("Message sent: %s", info.messageId);

    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = { nodeMailerConfig };