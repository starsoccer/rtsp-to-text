const sdk = require("microsoft-cognitiveservices-speech-sdk");
const intentMatch = require('./intentMatch').intentMatch;
const kill = require('tree-kill');
const speechConfig = sdk.SpeechConfig.fromSubscription("ENTER KEY HERE PLZ", "eastus");
speechConfig.speechRecognitionLanguage = "en-US";

async function recognizeSpeech(streamChildProcess, callback) {
    let pushStream = sdk.AudioInputStream.createPushStream();
    let audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    const phraseList = sdk.PhraseListGrammar.fromRecognizer(speechRecognizer);
    phraseList.addPhrases(['mmhmm', 'uhhuh', 'nuh']);

    streamChildProcess.stdout.on('data', (data) => {
        pushStream.write(data.slice());
    }).on('end', function() {
        pushStream.close();
    });

    const cleanup = () => {
        kill(streamChildProcess.pid, 'SIGINT');
        clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
        callback(undefined);
        cleanup();
    }, listenLength);

    const processText = (t) => {
        const result = intentMatch(t.toLowerCase());
        console.log('Intent Matched:', result);
        callback(result);
        cleanup();
    }

    speechRecognizer.recognizeOnceAsync(result => {
        switch (result.reason) {
            case sdk.ResultReason.RecognizedSpeech:
                console.log(`RECOGNIZED: Text=${result.text}`);
                processText(result.text);
                break;
            case sdk.ResultReason.NoMatch:
                console.log("NOMATCH: Speech could not be recognized.");
                callback(undefined);
                cleanup();
                break;
            case sdk.ResultReason.Canceled:
                const cancellation = sdk.CancellationDetails.fromResult(result);
                console.log(`CANCELED: Reason=${cancellation.reason}`);

                if (cancellation.reason == sdk.CancellationReason.Error) {
                    console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                    console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                    console.log("CANCELED: Did you set the speech resource key and region values?");
                }

                callback(undefined);
                cleanup();
                break;
        }
        speechRecognizer.close();
    });

    setTimeout(() => {
        callback(undefined);
        cleanup();
    }, listenLength);
}

module.exports = { recognizeSpeech };