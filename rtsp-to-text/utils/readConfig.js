function readConfig () {
 return require(process.env.CONFIG_PATH);
}

module.exports = { readConfig };