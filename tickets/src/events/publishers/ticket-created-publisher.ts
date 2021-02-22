import { Subjects, TicketCreatedEvent, Publisher } from '@microservices-tickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated
}