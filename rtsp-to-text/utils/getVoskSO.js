const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const download = require('download');
const readConfig = require('./readConfig').readConfig;

const getVoskSO = async () =>{
    console.log('Checking Vost SO Type');
    let URL = null;

    console.log(process.arch);
    switch (process.arch) {
        case 'arm':
            URL = 'https://github.com/alphacep/vosk-api/releases/download/v0.3.43/vosk-linux-armv7l-0.3.43.zip';
        case 'arm64':
            URL = 'https://github.com/alphacep/vosk-api/releases/download/v0.3.43/vosk-linux-aarch64-0.3.43.zip';
        default:
    }

    if (URL) {
        console.log('Starting Vosk SO Download');

        if (!fs.existsSync(process.env.vosk_so_path)){
            fs.mkdirSync(process.env.vosk_so_path);
        }

        const zipPath = path.join(process.env.vosk_so_path, 'voskso.zip');
        fs.writeFileSync(
            zipPath,
            await download(URL)
        );
        await extract(zipPath, { dir: process.env.vosk_so_path });
        fs.unlinkSync(zipPath);

        const folders = fs.readdirSync(process.env.vosk_so_path);
        const folder = folders[0];
        const filePath = path.join(process.env.vosk_so_path, folder, 'libvosk.so');
        const newPath = path.join(
            require.resolve('vosk'),
            '../lib/linux-x86_64/libvosk.so',
        );
        fs.renameSync(filePath, newPath);

        console.log('Vosk SO Download Complete');
    }
}

getVoskSO();