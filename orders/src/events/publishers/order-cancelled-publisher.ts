import { OrderCancelledEvent, Publisher, Subjects } from "@microservices-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}