
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const { exec } = require("child_process");
const buildPath = path.join(__dirname, "../build");
const exportPath = path.join(__dirname, "../build/gameplay.js");
const sourcePath = path.join(__dirname, "../build/static/js");
const sourceHtml = path.join(__dirname, "../public/index.html");
const exportHtml = path.join(__dirname, "../build/index.html");


function clear(file) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, "", function (err) {
            if (err) {
                throw err;
                console.log(err);
            }
            resolve();
        });
    });
}


function appendFiles(source, dir) {
    return new Promise((resolve, reject) => {

        try {

            fs.readdir(dir, function (err, files) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                let filesLoaded = 0;
                let maxFiles = files.length;
                //listing all files using forEach

                files.forEach(function (file) {
                    // console.log('file > ', file);
                    if (file.indexOf(".txt") == -1) {
                        appendFile(source, dir + "/" + file).then(() => {
                            filesLoaded++;
                            if (filesLoaded >= maxFiles) {
                                resolve();
                            }
                        });
                    } else {
                        filesLoaded++;
                    }
                });
            });

        } catch (err) {
            console.log(err);
            reject();
        }
    });
}




function appendFile(file, appendFile) {
    return new Promise((resolve, reject) => {
        try {

            fs.readFile(appendFile, "utf8", (err, data) => {
                if (err) throw err;
                fs.appendFile(file, data, function (err) {
                    if (err) throw err;
                    // console.log(appendFile + ' was appended');
                    resolve();
                });
            });


        } catch (err) {
            console.log(err);
            reject();
        }

    });

}



function startProcess() {

    exec("npm run init", (error, stdout, stderr) => {

        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }

        console.log("disable splitChunks ok");

        exec("npm run build", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`prepare build...`);

            clear(exportPath).then(() => {

                appendFiles(exportPath, sourcePath).then(() => {

                    fs.readFile(exportPath, "utf8", (err, data) => {
                        if (err) throw err;

                        var jsContent = data;

                        fs.readFile(sourceHtml, "utf8", (err, data) => {

                            var str = `<div id="root"></div>`;
                            var rpp_str = `<script type="text/javascript">` + jsContent + `</script>`;

                            data = data.replace(new RegExp(str, 'g'), rpp_str);

                            fsExtra.emptyDirSync(buildPath);

                            fs.writeFile(exportHtml, data, function (err) {
                                if (err) throw err;

                                console.log("build success");

                            });
                        });

                    });

                });

            });

        });
    });

}


startProcess();