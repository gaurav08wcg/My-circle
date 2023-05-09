const nodemailer = require("nodemailer");

module.exports = {
  /**
   * function for send mail
   * @param {Object} mailDetails : it's contain users Email Id, subject, plain text, html body
   *      mailDetails = {
   *          "userEmail" : "",
   *          "subject" : "",
   *          "text" : "",
   *          "html"
   *      }
   */
  sendMail: async function (mailDetails) {
    try {
      // create transporter
      let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: true, // true for 465, false for other ports
        auth: {
          user: `mycircle702@gmail.com`, // sender email
          pass: `itnhckkmotcqiuia`, // send email password (token)
        },
      });
      // console.log("transporter =>", transporter);

      // prepare mail options object
      let mailObject = {};
      mailObject["from"] = "mycircle702@gmail.com";
      mailObject["to"] = mailDetails?.userEmail; // user email id
      mailObject["subject"] = mailDetails?.subject; // mail Subject line
      if(mailDetails?.text) mailObject["text"] = mailDetails?.text; // plain text body
      if (mailDetails?.html) mailObject["html"] = mailDetails?.html; // html body

      // send mail
      const info = await transporter.sendMail(mailObject);
      // print msg id
      console.log("Message sent: %s", info.messageId);
      // print mail url
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.log("error =>", error);
    }
  },
};