const dataPool = require('../util/dataPool');
const Promise = require('promise');

exports.getParentMenu = function () {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where parent_id is null');
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getParentMenuByCIds = function (menu_ids) {
    return new Promise(async function (resolve, reject) {
        try {
            let result = [];
            if (menu_ids) {
                for (let i = 0; i < menu_ids.length; i++) {
                    let menus = await dataPool.query('select * from menu where parent_id is null and children_ids like ?', ['%#' + menu_ids[i] + '#%']);
                    let isExist = false;
                    for (let j = 0; j < result.length; j++) {
                        if (result[j] && menus[0] && result[j].id == menus[0].id) {
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist && menus[0]) {
                        result.push(menus[0]);
                    }
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getSubMenuByCid = function (menu_ids) {
    return new Promise(async function (resolve, reject) {
        try {
            let result = [];
            if (menu_ids) {
                for (let i = 0; i < menu_ids.length; i++) {
                    let menus = await dataPool.query('select * from menu where parent_id is not null and children_ids like ?', ['%#' + menu_ids[i] + '#%']);
                    result = result.concat(menus);
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getChildrenMenu = function (ids) {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where id in ( ? ) and children_ids is null', [ids]);
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getSubMenuByPIdCId = function (parent_id, menu_ids) {
    return new Promise(async function (resolve, reject) {
        try {
            let result = [];
            if (menu_ids) {
                for (let i = 0; i < menu_ids.length; i++) {
                    if (menu_ids[i] != '') {
                        let menus = await dataPool.query('select * from menu where parent_id=? and (children_ids like ? or (children_ids is null and id=?))', [parent_id, '%#' + menu_ids[i] + '#%', menu_ids[i]]);
                        let isExist = false;
                        for (let j = 0; j < result.length; j++) {
                            if (result[j] && menus[0] && result[j].id == menus[0].id) {
                                isExist = true;
                                break;
                            }
                        }
                        if (!isExist && menus[0]) {
                            result.push(menus[0]);
                        }
                    }
                }
            }
            resolve(result);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getMenuByPath = function (path) {
    return new Promise(async function (resolve, reject) {
        try {
            let menu = await dataPool.query('select * from menu where path=? or auth_path like ? limit 1', [path, '%#' + path + '#%']);
            resolve(menu);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getChildrenMenuByIds = function (ids, menu_ids) {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where id in ( ? ) and id in ( ? ) and children_ids is null', [ids, menu_ids]);
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getSubMenu = function () {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where parent_id is not null and children_ids is not null');
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};

exports.getSubMenuByPId = function (parent_id) {
    return new Promise(async function (resolve, reject) {
        try {
            let menus = await dataPool.query('select * from menu where parent_id=?', [parent_id]);
            resolve(menus);
        } catch (error) {
            reject(error);
        }
    })
};