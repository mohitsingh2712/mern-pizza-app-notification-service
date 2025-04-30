import { MailTransport } from "../mail";

export const createNotificaionTransport = (type: "mail" | "sms") => {
  switch (type) {
    case "mail":
      return new MailTransport();
    case "sms":
      throw new Error("SMS transport not implemented");
    default:
      throw new Error("Invalid transport type");
  }
};
