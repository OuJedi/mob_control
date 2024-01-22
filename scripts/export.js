const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");

const webpackConfig = path.join(__dirname, '../src/config/index.js');


//disable splitChunks
exec("npm run init", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`No splitChunks js ok`);

    //Build
    exec("npm run build", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`Build ok`);


        //Path patch
        exec("npm run patch", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }

            console.log(`Ready for deploy`);
        });




    });
});










