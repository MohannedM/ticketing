import React, { useState } from 'react'
import axios from 'axios'

export default ({url, method, body, onSuccess}) => {
    const [errors, setErrors] = useState(null)

    const doRequest = async (props = {}) => {
        try {
            const response = await axios[method](url, {
                ...body,
                ...props,
            })
            onSuccess(response.data)
            return response.data
        } catch(err) {
            setErrors((
            <div className="alert alert-danger">
                <h4>Oops....</h4>
                <ul className="my-4">
                    {err.response.data.errors.map(err => <li key={err.message}>{err.message}</li> ) }
                </ul>
            </div>
            ))
        }
    }
    return { doRequest, errors}
}