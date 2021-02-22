import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async (done) => {
    const ticket = Ticket.build({
        title: 'Concert',
        userId: 'any',
        price: 20
    })

    await ticket.save()

    const firstTicketCall = await Ticket.findById(ticket.id)
    const secondTicketCall = await Ticket.findById(ticket.id)

    firstTicketCall.set({
        title: 'Updated'
    })

    secondTicketCall.set({
        title: 'Updated as well'
    })

    await firstTicketCall.save()

    try{
        await secondTicketCall.save()
    } catch(err) {
        return done()
    }
    throw new Error('Should not reach this point')
})

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Concert',
        userId: 'any',
        price: 20
    })

    await ticket.save()
    expect(ticket.version).toEqual(0)

    await ticket.save()
    expect(ticket.version).toEqual(1)

    await ticket.save()
    expect(ticket.version).toEqual(2)
})