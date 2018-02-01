exports.renderException = function (res, error) {
    res.render("error", {
        hideLayout: true,
        message : error.message,
        error: error
    });
};

exports.sendException = function (res, error) {
    res.send({status : false, error: error});
};