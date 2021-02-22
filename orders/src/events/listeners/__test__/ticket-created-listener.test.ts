import { TicketCreatedEvent } from "@microservices-tickets/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketCreatedListener } from "../ticket-created-listener"

const setup = async () => {
    const listener = new TicketCreatedListener(natsWrapper.client)

    const data: TicketCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        price: 25,
        title: 'Concert',
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    const ticket = await Ticket.findById(data.id)
    expect(ticket.id).toEqual(data.id)
    expect(ticket.version).toEqual(data.version)
    expect(ticket.title).toEqual(data.title)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})