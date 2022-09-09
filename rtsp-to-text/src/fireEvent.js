const axios = require('axios');

const url = 'http://supervisor/core/api/events';

const fireEvent = (eventType, bearerToken, contextID, data) => {
    global.logger.trace({eventType, contextID, data}, 'Sending Event to HA');
    try {
        axios.post(
            `${url}/${eventType}`,
            {
                result: true,
                data,
                context_id: contextID,
            },
            {
                headers: {
                    Authorization: `Bearer ${bearerToken}`
                }
            }
        );
    } catch (error) {
        global.logger.error({error}, 'Axios Event Error');
    }
}

module.exports = { fireEvent };