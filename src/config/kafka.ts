/* eslint-disable @typescript-eslint/no-unused-vars */
import { Consumer, EachMessagePayload, Kafka, KafkaConfig } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { createNotificaionTransport } from "../factories/notification-factory";
import { handleOrderHtml, handleOrderText } from "../handlers/orderHandler";
import config from "config";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;

  constructor(clientId: string, brokers: string[]) {
    let kafkaConfig: KafkaConfig = {
      clientId: clientId,
      brokers: brokers,
    };
    if (config.get("NODE_ENV") === "production") {
      kafkaConfig = {
        ...kafkaConfig,
        ssl: true,
        connectionTimeout: 45000,
        sasl: {
          mechanism: "plain",
          username: config.get("kafka.sasl.username"),
          password: config.get("kafka.sasl.password"),
        },
      };
    }
    const kafka = new Kafka(kafkaConfig);

    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the consumer
   */
  async disconnectConsumer() {
    await this.consumer.disconnect();
  }

  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        // Logic to handle incoming messages.
        if (topic === "billing") {
          const transport = createNotificaionTransport("mail");
          const order = JSON.parse(message.value.toString());
          await transport.send({
            to: order.data.customerId.email || config.get("mail.from"),
            subject: "Order update.",
            text: handleOrderText(order),
            html: handleOrderHtml(order),
          });
        }
      },
    });
  }
}
