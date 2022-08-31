const getRTSPStream = require('./src/getRTSPStream').getRTSPStream;
//const recognizeSpeech = require('./src/recognizeSpeech').recognizeSpeech;
const handleSpeech = require('./src/handleSpeech').handleSpeech;
//const handleSpeech = require('./src/handleSpeechVosk').handleSpeech;
const getModel = require('./src/getModel').getModel;
const http = require('http');
const axios = require('axios');
const MODEL_PATH ='/model.tflite';

const config = require(process.env.CONFIG_PATH);
getModel(config.model_url, MODEL_PATH);
const RTSPLookup = config.RTSP_lookup.reduce((lookup,item)=> (lookup[item.device_name]=item.rtsp_id,lookup),{});

const httpResponse = (res, statusCode, data) => {
    console.log(statusCode, data);
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });

    if (data) {
        res.write(JSON.stringify(data));
    }

    res.end();
}

const sendResponse = (contextID, data) => {
    axios.post(config.webhook, {
        result: true,
        data,
        contextID,
    });
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
    console.log('Got a request sir');
    if (validateAuth(req.headers.authorization)) {    
        const path = req.url.substr(1);
        const contextID = req.headers.contextid || req.headers.contextID;
    
        console.log('Context ID', contextID);
    
        if (path in RTSPLookup) {
            const id = RTSPLookup[path];
            console.log(`Location mapped to ${id}`);
    
            const stream = getRTSPStream(config.rtsp_url, config.rtsp_username, config.rtsp_password, id);
            handleSpeech(MODEL_PATH, stream, async (output) => {
            //handleSpeech(stream, config.listenLength, async (output) => {
                console.log('Output', output);
                if (output) {
                    sendResponse(req.headers.contextid, output);
                }
            });
            /*recognizeSpeech(stream, async (output) => {
                if (output) {
                    sendResponse(req.headers.contextid, output);
                }
            });*/
    
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