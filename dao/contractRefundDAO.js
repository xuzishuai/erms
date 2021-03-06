const dataPool = require('../util/dataPool');
const Promise = require('promise');
const uuid = require('node-uuid');
const fileUtil = require('../util/fileUtil');

exports.getContractRefundByCondition = function (condition) {
    return new Promise(async function (resolve, reject) {
        try {
            let sql = 'select * from contract_refund where 1=1';
            let params = [];
            if (condition) {
                if (condition.student_id && condition.student_id != '') {
                    sql += ' and contract_id in (select id from contract where student_id=?)';
                    params[params.length] = condition.student_id;
                }
                if (condition.contract_no && condition.contract_no != '') {
                    sql += ' and contract_id in (select id from contract where contract_no like ?)';
                    params[params.length] = '%' + condition.contract_no + '%';
                }
                if (condition.grade_id && condition.grade_id != '') {
                    sql += ' and contract_id in (select id from contract where grade_id=?)';
                    params[params.length] = condition.grade_id;
                }
                if (condition.signer_id && condition.signer_id !== '') {
                    sql += ' and contract_id in (select id from contract where signer_id=?)';
                    params[params.length] = condition.signer_id;
                }
                if (condition.start_date && condition.start_date != '') {
                    sql += ' and refund_date>=?';
                    params[params.length] = condition.start_date;
                }
                if (condition.end_date && condition.end_date != '') {
                    sql += ' and refund_date<=?';
                    params[params.length] = condition.end_date;
                }
            }
            sql += ' order by refund_date';
            let contractRefunds = await dataPool.query(sql, params);
            resolve(contractRefunds);
        } catch (error) {
            reject(error);
        }
    })
};

exports.saveContractRefund = function (contractRefund) {
    return new Promise(async function (resolve, reject) {
        try {
            let sqls = [], params = [];
            let now = new Date();
            sqls[sqls.length] = 'update contract set status_id=?, update_at=? where id=?';
            params[params.length] = ['06', now, contractRefund.contract_id];//退费后此合同设置为作废状态
            //删除带文件的排课申请数据
            sqls[sqls.length] = 'delete from course_apply where contract_id=?';
            params[params.length] = [contractRefund.contract_id];
            //删除待审核、未上课和未通过的课程安排
            sqls[sqls.length] = 'delete from course_schedule where contract_id=? and (status_id=? or status_id=? or status_id=?)';
            params[params.length] = [contractRefund.contract_id, '01', '02', '03'];
            
            sqls[sqls.length] = 'insert into contract_refund(id, contract_id, refund_date, money, operator_id, create_at) values (?, ?, ?, ?, ?, ?)';
            params[params.length] = [uuid.v1(), contractRefund.contract_id, contractRefund.refund_date, contractRefund.money, contractRefund.operator_id, now];
            //删除带文件的排课申请的文件
            let course_applies = await dataPool.query('select * from course_apply where contract_id=?', [contractRefund.contract_id]);
            for (let i = 0; i < course_applies.length; i++) {
                await fileUtil.deleteFile('../ermsFiles/'+course_applies[i].path);
            }

            await dataPool.batchQuery(sqls, params);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
};