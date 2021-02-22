import { OrderCancelledEvent, OrderStatus } from "@microservices-tickets/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledListener } from "../listeners/order-cancelled-listener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = Order.build({
        id: Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: 'asdf',
        version: 0,
    })

    await order.save()

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asddas',
        }
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, msg, data, order }
}

it('updates the status of the order', async () => {
    const { listener, msg, data, order } = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(data.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    const { listener, msg, data } = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})
