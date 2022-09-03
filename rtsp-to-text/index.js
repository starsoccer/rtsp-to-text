const getRTSPStream = require('./src/getRTSPStream').getRTSPStream;
const handleSpeech = require('./src/handleSpeechVosk').handleSpeech;
const readConfig = require('./utils/readConfig').readConfig;
const http = require('http');
const fireEvent = require('./src/fireEvent').fireEvent;

const config = readConfig();
global.log_level = config.log_level;
global.logger = require('pino')({level: config.log_level});

const RTSPLookup = config.RTSP_lookup.reduce((lookup,item)=> (lookup[item.device_name]=item.rtsp_id,lookup),{});

const httpResponse = (res, statusCode, data) => {
    global.logger.debug({statusCode, data}, 'Sending HTTP Response');
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });

    if (data) {
        res.write(JSON.stringify(data));
    }

    res.end();
}

const validateAuth = (authHeader) => {
    var token = authHeader.split(/\s+/).pop() || '';        // and the encoded auth token
    var auth = Buffer.from(token, 'base64').toString(); // convert from base64
    var parts = auth.split(/:/);                        // split on colon
    var username = parts.shift();                       // username is first
    var password = parts.join(':');                     // everything else is the password
   
    return (
        username === config.addon_username &&
        password === config.addon_password
    );
};


const server = http.createServer(function (req, res) {
    global.logger.trace('Request Received');
    if (validateAuth(req.headers.authorization)) {
        const path = req.url.substr(1);
        const contextID = req.headers.contextid || req.headers.contextID;
        global.logger.trace({contextID, path}, 'Authentication Valid');
    
        if (path in RTSPLookup) {
            const id = RTSPLookup[path];
            global.logger.trace({contextID, path, deviceID: id}, `Location mapped`);
    
            const stream = getRTSPStream(config.rtsp_url, config.rtsp_username, config.rtsp_password, id);
            handleSpeech(stream, config.listen_length, async (output) => {
                global.logger.debug({contextID, path, deviceID: id, intent: output}, `Intent Output`);
                if (output) {
                    fireEvent(
                        'rtsp_actionable_notifications_speech',
                        process.env.SUPERVISOR_TOKEN,
                        contextID,
                        output
                    );
                }
            });
    
            httpResponse(res, 200);
        } else {
            global.logger.warn({contextID, path}, 'Unknown Device');
            httpResponse(res, 404);
        };
    } else {
        global.logger.warn('Invalid Authentication');
        httpResponse(res, 401);
    }
});

server.listen(config.port);
global.logger.info({port: config.port}, 'Server Started');