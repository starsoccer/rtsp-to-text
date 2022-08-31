const fs = require('fs');
const download = require('download');

const getModel = async (url, modelPath) =>{
    fs.writeFileSync(modelPath, await download(url));
}

module.exports = { getModel };