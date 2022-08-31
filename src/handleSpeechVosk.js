const vosk = require('vosk');
const intentMatch = require('./intentMatch').intentMatch;
const kill = require('tree-kill');

const getRecognizer = () => {
    if (global.recognizer) {
        return global.recognizer;
    }

    const model = new vosk.Model('./models/vosk');
    const rec = new vosk.Recognizer({model: model, sampleRate: 16000});
    global.recognizer = rec;
    return rec;
}



async function handleSpeech(streamChildProcess, listenLength, callback) {
    const rec = getRecognizer();
    let bestMatch = undefined;

    streamChildProcess.stdout.on('data', (data) => {
        const a = rec.acceptWaveform(data);
    }).on('end', function() {
        const text = rec.finalResult();
        console.log('Final Text', text);
        const intentText = intentMatch(text.text.toLowerCase());
        console.log('Final Intent', intentText);

        const bestIntent = intentText || bestMatch;
        console.log('Best Intent', bestIntent);
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
        console.log('Decoded Text', text, new Date());
        if (text.text) {
            const intent = intentMatch(text.text.toLowerCase());
            console.log('Intent', intent);
            if (intent) {
                bestMatch = intent;
                console.log('Updated Best Intent');
                cleanup();
            }
        }
    }, 250);

    setTimeout(() => {
        cleanup();
    }, listenLength);
}

module.exports = { handleSpeech };