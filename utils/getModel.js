const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');
const download = require('download');
const readConfig = require('./readConfig').readConfig;

const getModel = async () =>{
    console.log('Starting Model Download');
    const modelPath = process.env.model_path;
    const modelFilePath = path.join(modelPath, 'vosk.zip');
    const url = readConfig().model_url;

    if (!fs.existsSync(modelPath)){
        fs.mkdirSync(modelPath);
    }

    fs.writeFileSync(
        modelFilePath,
        await download(url)
    );

    await extract(modelFilePath, { dir: modelPath });
    fs.unlinkSync(modelFilePath);

    const folders = fs.readdirSync(modelPath);
    const folder = folders[0];
    const folderPath = path.join(modelPath, folder);
    fs.renameSync(folderPath, path.join(modelPath, 'vosk'));

    console.log('Model Download Complete');
}

getModel();