$('.select2').select2({
    allowClear: true,
    formatNoMatches: function () { return "没有找到匹配项"; },
    formatLoadMore: function () { return "加载结果中…"; },
    formatSearching: function () { return "搜索中…"; }
});