"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.run = void 0;
var cst_to_ast_1 = require("../cst-to-ast");
// @ts-ignore
function run(cstNode, children) {
    var _a, _b, _c, _d;
    var variableDeclaratorList = [].concat.apply([], (_b = (_a = children.variableDeclaratorList) === null || _a === void 0 ? void 0 : _a.map(function (e) { return cst_to_ast_1.cstToAst(e); })) !== null && _b !== void 0 ? _b : []);
    var localVariableTypeAst = [].concat.apply([], (_d = (_c = children.localVariableType) === null || _c === void 0 ? void 0 : _c.map(function (e) { return cst_to_ast_1.cstToAst(e); })) !== null && _d !== void 0 ? _d : []);
    return {
        kind: 'Keyword',
        start: cstNode.location.startOffset,
        end: cstNode.location.endOffset + 1,
        pos: cstNode.location.startOffset,
        children: __spreadArrays(localVariableTypeAst.filter(function (e) { return e.kind === 'TypeReference'; }), variableDeclaratorList)
    };
}
exports.run = run;
