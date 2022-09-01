const vosk = require('vosk');

if (global.log_level !== 'debug' && global.log_level !== 'trace') {
    vosk.setLogLevel(-1);
}

const intentMatch = require('./intentMatch').intentMatch;
const kill = require('tree-kill');
const path = require('path');

const getRecognizer = () => {
    if (global.recognizer) {
        global.logger.trace('Using Cached Recognizer');
        return global.recognizer;
    }

    global.logger.trace(`Recognizer Doesn't exist creating`);
    const modelPath = path.join(process.env.model_path, 'vosk');
    const model = new vosk.Model(modelPath);
    const rec = new vosk.Recognizer({model: model, sampleRate: 16000});
    global.recognizer = rec;
    return rec;
}

async function handleSpeech(streamChildProcess, listenLength, callback) {
    const rec = getRecognizer();
    let bestMatch = undefined;

    streamChildProcess.stdout.on('data', (data) => {
        rec.acceptWaveform(data);
    }).on('end', function() {
        const text = rec.finalResult();
        global.logger.debug({STT: text}, `Final Text Result`);
        const intentText = intentMatch(text.text.toLowerCase());
        global.logger.debug({STT: text, intent: intentText}, `Final Intent Result`);

        const bestIntent = intentText || bestMatch;
        global.logger.debug({STT: text, intent: bestIntent}, `Picking Best Intent Result`);
        callback(bestIntent);
        rec.reset();
    });

    const cleanup = () => {
        clearInterval(interval);
        kill(streamChildProcess.pid, 'SIGINT');
        rec.reset();
    }

    const interval = setInterval(() => {
        const text = rec.result();
        global.logger.debug({STT: text}, `Intermediate Text Result`);
        if (text.text) {
            const intent = intentMatch(text.text.toLowerCase());
            global.logger.debug({STT: text.text, intent}, `Intermediate Intent Result`);
            if (intent) {
                bestMatch = intent;
                global.logger.debug({STT: text.text, intent}, `Updated Best Intent Result`);
                cleanup();
            }
        }
    }, 250);

    setTimeout(() => {
        cleanup();
    }, listenLength);
}

module.exports = { handleSpeech };