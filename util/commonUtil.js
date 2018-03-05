exports.toMap = function (model) {
    let modelMap = {};
    if (model && model.length > 0) {
        for (let i = 0; i < model.length; i++) {
            modelMap[model[i].id] = model[i];
        }
    }
    return modelMap;
};