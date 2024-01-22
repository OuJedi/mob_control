const fs = require('fs');
const path = require('path');

const webpackConfig = path.join(__dirname, '../build/index.html');



//disable splitChunks
fs.readFile(webpackConfig, "utf8", (err, data) => {

    var str = `src="/static`
    var rpp_str = `src="static`

     var file = '<script src="https://www.facebook.com/assets.php/en_US/fbinstant.latest.js"></script>';
     var rpp_file = '';
    


    data = data.replace(new RegExp(str,'g'), rpp_str);

     data = data.replace(new RegExp(file,'g'), rpp_file);    

    fs.writeFile(webpackConfig, data, function (err) {
        if (err) throw err;

        console.log("patch js path ok");

    });

});







