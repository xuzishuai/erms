const TableManaged = function () {

    return {
        init: function () {
            if (!jQuery().dataTable) {
                return;
            }

            $('table').dataTable({
                "aLengthMenu": [
                    [15, 30, 50, -1],
                    [15, 30, 50, "全部"] // change per page values here
                ],
                "iDisplayLength": 15,
                "sDom": "<'row-fluid'>t<'row-fluid'<'span4'l><'span4'i><'span4'p>>",
                "sPaginationType": "bootstrap",
                "oLanguage": {
                    "sLengthMenu": "每页显示 _MENU_ 条",
                    "oPaginate": {
                        "sFirst": "第一页",
                        "sPrevious": "上一页",
                        "sNext": "下一页",
                        "sLast": "最后一页"
                    },
                    "sEmptyTable": "对不起，查询不到任何相关数据",
                    "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
                    "sInfoEmpty" : "显示 0 到 0 条，共 0 条记录",
                    "sProcessing": "正在加载中...",
                    "sSearch": "搜索 ",
                    "sZeroRecords": "找不到相关数据",
                    "sInfoFiltered": ""
                },
                "aoColumnDefs": [{
                    'bSortable': false,
                    'aTargets': [parseInt($('.table_action').attr('data-colNum'))]//最后一列不能排序
                }
                ]
            });

            jQuery('.dataTables_filter input').addClass("m-wrap small"); // modify table search input
            jQuery('.dataTables_length select').addClass("m-wrap small"); // modify table per page dropdown
            jQuery('.dataTables_length select').select2(); // initialzie select2 dropdown
        }

    };

}();