import React, { useState, useEffect } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/use-request'
import Router from 'next/router'

const ShowOrder = ({order, currentUser}) => {
    const [timeLeft, setTimeLeft] = useState(0)
    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (body) => Router.push('/orders')
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft / 1000))
        }
        findTimeLeft()
        const timerId = setInterval(findTimeLeft, 1000)
        return () => {
            clearInterval(timerId)
        }
    }, [])

    if(timeLeft < 0) return <div>Order expired</div>
    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout
            token={({id}) => doRequest({token: id})}
            stripeKey="pk_test_JPY4UvsGcRkedOWBQ781UWSO00GJHzPhJv"
            amount={order.ticket.price * 100}
            email={currentUser.email}
             />
             {errors}
        </div>
    )
}

ShowOrder.getInitialProps = async (context, client) => {
    const { orderId } = context.query
    const { data } = await client.get(`/api/orders/${orderId}`)

    return { order: data}
}

export default ShowOrder