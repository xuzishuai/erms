exports.renderException = function (res, error) {
    res.render("error", {
        hideLayout: true,
        message : error.message,
        error: error
    });
};

exports.sendException = function (res, err) {
    res.send({status : false, "error": err});
};