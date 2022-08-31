const YES = 'yes';
const NO = 'no';

function intentMatch (text) {
    console.log('Speech interpreted as:', text);
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