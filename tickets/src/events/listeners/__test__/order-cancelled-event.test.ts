import { OrderCancelledEvent, OrderStatus } from "@microservices-tickets/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const orderId = mongoose.Types.ObjectId
    const ticket = Ticket.build({
        title: 'new concert',
        price: 20,
        userId: mongoose.Types.ObjectId().toHexString(),
    })

    ticket.set({ orderId })

    await ticket.save()

    const data: OrderCancelledEvent['data'] =    {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, ticket, msg, orderId }
}

it('updates the ticket, publishes an event, and acks the message', async () => {
    const { msg, data, ticket, orderId, listener } = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket)

    expect(updatedTicket.orderId).toEqual(undefined)
    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})