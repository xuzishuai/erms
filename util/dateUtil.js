const moment = require('moment');

exports.dateFormat = function (date) {
    return moment(date).format("YYYY-MM-DD");
};

exports.dateTimeFormat = function (date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};