/**
 * 图表类型定义
 *
 * BigScreen Pro大屏可视化平台 - 图表组件专用类型
 */
// ============================================================
// 图表类型枚举
// ============================================================
/** ECharts图表类型 */
export var EChartsType;
(function (EChartsType) {
    // 基础图表
    EChartsType["LINE"] = "line";
    EChartsType["BAR"] = "bar";
    EChartsType["PIE"] = "pie";
    EChartsType["SCATTER"] = "scatter";
    EChartsType["RADAR"] = "radar";
    // 高级图表
    EChartsType["TREEMAP"] = "treemap";
    EChartsType["SUNBURST"] = "sunburst";
    EChartsType["SANKEY"] = "sankey";
    EChartsType["FUNNEL"] = "funnel";
    EChartsType["GAUGE"] = "gauge";
    // 地理图表
    EChartsType["MAP"] = "map";
    EChartsType["LINES"] = "lines";
    EChartsType["EFFECT_SCATTER"] = "effectScatter";
    // 关系图表
    EChartsType["GRAPH"] = "graph";
    // 自定义系列
    EChartsType["CUSTOM"] = "custom";
    // 组合图表
    EChartsType["PICTORIAL_BAR"] = "pictorialBar";
    EChartsType["THEME_RIVER"] = "themeRiver";
    // 3D图表
    EChartsType["BAR_3D"] = "bar3D";
    EChartsType["LINE_3D"] = "line3D";
    EChartsType["SCATTER_3D"] = "scatter3D";
    EChartsType["SURFACE_3D"] = "surface3D";
    EChartsType["MAP_3D"] = "map3D";
})(EChartsType || (EChartsType = {}));
//# sourceMappingURL=chart.js.map