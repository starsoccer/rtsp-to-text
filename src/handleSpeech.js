const Ds = require('stt');

const intentMatch = require('./intentMatch').intentMatch;
const kill = require('tree-kill');

async function handleSpeech(modelPath, streamChildProcess, callback) {
    const model = new Ds.Model(modelPath);
    const audioStream = model.createStream();

    console.log('Starting STT Conversion');

    streamChildProcess.stdout.on('data', (data) => {
        audioStream.feedAudioContent(data.slice());
    }).on('end', function() {
        const text = audioStream.finishStream();
        const intentText = intentMatch(text.toLowerCase());
        console.log('End called', intentText);
        callback(intentText);
    });

    const interval = setInterval(() => {
        const text = audioStream.intermediateDecode();
        //console.log('Decoded Text', text);
        if (text && intentMatch(text.toLowerCase())) {
            clearInterval(interval);
            kill(streamChildProcess.pid, 'SIGINT');
        }
    }, 250);
}

module.exports = { handleSpeech };