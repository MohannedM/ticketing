import { Subjects, TicketUpdatedEvent, Publisher } from '@microservices-tickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}