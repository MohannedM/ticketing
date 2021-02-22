import { OrderCreatedEvent, Publisher, Subjects } from "@microservices-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
}