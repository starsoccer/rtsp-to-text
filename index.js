const getRTSPStream = require('./src/getRTSPStream').getRTSPStream;
const handleSpeech = require('./src/handleSpeechVosk').handleSpeech;
const readConfig = require('./utils/readConfig').readConfig;
const http = require('http');
const fireEvent = require('./src/fireEvent').fireEvent;

const config = readConfig();
const RTSPLookup = config.RTSP_lookup.reduce((lookup,item)=> (lookup[item.device_name]=item.rtsp_id,lookup),{});

const httpResponse = (res, statusCode, data) => {
    console.log(statusCode, data);
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
    console.log('Got a request sir', new Date());
    if (validateAuth(req.headers.authorization)) {    
        const path = req.url.substr(1);
        const contextID = req.headers.contextid || req.headers.contextID;
    
        console.log('Context ID', contextID);
    
        if (path in RTSPLookup) {
            const id = RTSPLookup[path];
            console.log(`Location mapped to ${id}`);
    
            const stream = getRTSPStream(config.rtsp_url, config.rtsp_username, config.rtsp_password, id);
            handleSpeech(stream, config.listen_length, async (output) => {
                console.log('Output', output, new Date());
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
            httpResponse(res, 404);
        };
    } else {
        httpResponse(res, 401);
    }
});

server.listen(config.port);
console.log('Listening on port', config.port);