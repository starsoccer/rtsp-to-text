const YES = 'yes';
const NO = 'no';

function intentMatch (text) {
    global.logger.debug({STT: text}, 'Attempting to match Intent');
    if (
        text.includes('y') ||
        text.includes('sure') ||
        text.includes('mmhmm')
    ) {
        return YES;
    }

    if (
        text.includes('n') ||
        text.includes('nope') ||
        text.includes('nah') ||
        text.includes('no')
    ) {
        return NO;
    }

    return undefined;
}

module.exports = { intentMatch };