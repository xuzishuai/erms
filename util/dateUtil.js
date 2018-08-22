const moment = require('moment');

exports.dateFormat = function (date) {
    return moment(date).format("YYYY-MM-DD");
};

exports.dateTimeFormat = function (date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

exports.dateTimeMinuteFormat = function (date) {
    return moment(date).format("YYYY-MM-DD HH:mm");
};

exports.addDays = function (date, days) {
    return moment(date).add(days, 'days').format("YYYY-MM-DD");
};