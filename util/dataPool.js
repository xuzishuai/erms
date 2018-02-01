const mysql = require('mysql');
const Promise = require('promise');

//创建连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'erms',
    port: 3306
});

exports.getById = function (table, id) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, conn){
            if(err){
                reject(err);
            }else{
                conn.query('select * from ' + table + ' where id=?', [id], function(err, results){
                    conn.release();
                    if (err) reject(err);
                    else resolve(results);
                })
            }
        })
    })
};

exports.getAll = function (table) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, conn){
            if(err){
                reject(err);
            }else{
                conn.query('select * from ' + table, function(err, results){
                    conn.release();
                    if (err) reject(err);
                    else resolve(results);
                })
            }
        })
    })
};

exports.query = function (sql, params) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err, conn){
            if(err){
                reject(err);
            }else{
                conn.query(sql, params, function(err, results){
                    //释放连接
                    conn.release();
                    if (err) reject(err);
                    else resolve(results);
                })
            }
        })
    })
};

exports.batchQuery = function (sqls, params) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, conn) {
            if (err) {
                reject(err);
            } else {
                function connQuery(sql, params) {
                    return new Promise(function (resolve, reject) {
                        conn.query(sql, params, function (err, results, fields) {
                            if (err) {
                                conn.rollback(function () {
                                    reject(err);
                                })
                            }
                            else resolve(results);
                        })
                    })
                }

                //开始事务
                conn.beginTransaction(async function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        try {
                            for (let i = 0; i < sqls.length; i++) {
                                await connQuery(sqls[i], params[i]);
                            }
                            conn.commit(function (err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                    conn.release();
                                }
                            })
                        } catch (err) {
                            reject(err);
                        }
                    }
                })
            }
        })
    })
};