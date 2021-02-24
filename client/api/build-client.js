import axios from 'axios'

const buildClient = ({ req }) => {
    if(typeof window === 'undefined') {
        const client = axios.create({
            baseURL: 'http://www.ticketing-mohannedm.xyz/',
            headers: req.headers
        })

        return client
      } else {
        const client = axios.create({
            baseURL: ''
        })
        return client
      }
}

export default buildClient