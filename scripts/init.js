const fs = require('fs');
const path = require('path');

const webpackConfig = path.join(__dirname, '../node_modules/react-scripts/config/webpack.config.js');



//disable splitChunks
fs.readFile(webpackConfig, "utf8", (err, data) => {

    var str = `splitChunks: {
        chunks: 'all',
        name: false,
      }`

    var rpp_str = `splitChunks: {
        //chunks: 'all',
        //name: false,
      }`

    data = data.replace(str, rpp_str);

    fs.writeFile(webpackConfig, data, function (err) {
        if (err) throw err;

        console.log("init ok");

    });

});







