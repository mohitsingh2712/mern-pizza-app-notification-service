import { Message, NotificationTransport } from "./types/notification-types";
import nodemailer from "nodemailer";
import config from "config";
export class MailTransport implements NotificationTransport {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.get("mail.host"),
      port: config.get("mail.port"),
      secure: false,
      auth: {
        user: config.get("mail.user"),
        pass: config.get("mail.password"),
      },
    });
  }
  async send(message: Message) {
    const mailOptions = {
      from: config.get("mail.from") as string,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${message.to}`);
    } catch (error) {
      console.error(`Failed to send email to ${message.to}: ${error}`);
    }
  }
}
