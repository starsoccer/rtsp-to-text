function getRTSPStream (url, username, password, streamID) {
    const fullURL = new URL(url);
    fullURL.username = username;
    fullURL.password = password;
    fullURL.pathname = streamID
    fullURL.search = 'enableSrtp';

    global.logger.trace({rtsp: fullURL.toString()}, `Starting Stream`);

    const child_process = require('child_process');
    const options = [
        '-nostdin',
        "-rtsp_transport",
        "tcp",
        '-vn',
        "-i",
        fullURL.toString(),
        '-c:a pcm_s16le -ar 16000 -ac 1 -f wav pipe:1',
    ]

    const stream = child_process.spawn('ffmpeg', options, {
        detached: false,
        shell: true,
    });

    const on_exit = (error) => {
        if (error) {
            global.logger.error({error: e}, `FFMPEG Error`);
        } else {
            global.logger.trace(`FFMPEG Closed Cleanly`);
        }
    }

    stream.on('SIGINT',on_exit);
    stream.on('exit',on_exit);
    stream.on('error',on_exit);

    return stream;
}

module.exports = { getRTSPStream };