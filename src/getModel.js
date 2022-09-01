const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const download = require('download');

const getModel = async (url, modelPath) =>{
    console.log('Starting Model Download');
    const modelFilePath = path.join(modelPath, 'vosk.zip');

    if (!fs.existsSync(modelPath)){
        fs.mkdirSync(modelPath);
    }

    fs.writeFileSync(
        modelFilePath,
        await download(url)
    );

    await extract(modelFilePath, { dir: modelPath });

    const folders = fs.readdirSync('./models');
    const folder = folders[0];
    const folderPath = path.join(modelPath, folder);
    fs.renameSync(folderPath, path.join(modelPath, 'vosk'));

    console.log('Model Download Complete');
}

module.exports = { getModel };