import { MailTransport } from "../mail";
import { NotificationTransport } from "../types/notification-types";

const transports: NotificationTransport[] = [];
export const createNotificaionTransport = (type: "mail" | "sms") => {
  switch (type) {
    case "mail": {
      const requiredTransport = transports.find(
        (transport) => transport instanceof MailTransport,
      );
      if (requiredTransport) {
        return requiredTransport;
      }
      const instance = new MailTransport();
      transports.push(instance);
      return instance;
    }
    case "sms":
      throw new Error("SMS transport not implemented");
    default:
      throw new Error("Invalid transport type");
  }
};
