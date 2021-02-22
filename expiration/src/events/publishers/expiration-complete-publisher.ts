import { ExpirationCompleteEvent, Publisher, Subjects } from "@microservices-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}