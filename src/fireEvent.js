const axios = require('axios');

const url = 'http://supervisor/core/api/events';

const fireEvent = (eventType, bearerToken, contextID, data) => {
    console.log('Sending Response', eventType, bearerToken, contextID, data, new Date());
    try {
        axios.post(
            `${url}/${eventType}`,
            {
                result: true,
                data,
                contextID,
            },
            {
                headers: {
                    Authorization: `Bearer ${bearerToken}`
                }
            }
        );
    } catch (err) {
        console.log('Safely Caught Error', err);
    }
}

module.exports = { fireEvent };