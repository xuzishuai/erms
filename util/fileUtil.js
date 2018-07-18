const fs = require('fs');
const Promise = require('promise');

exports.deleteFile = function (filePath) {
    return new Promise(function (resolve, reject) {
        fs.exists(filePath, function (exists) {
            if (exists) {
                fs.unlink(filePath, function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            } else {
                resolve();
            }
        });
    })
};