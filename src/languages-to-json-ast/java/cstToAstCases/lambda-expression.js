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
    var _a, _b, _c;
    var lambdaParameters = children.lambdaParameters;
    var arrow = children.Arrow;
    var lambdaBody = children.lambdaBody;
    return {
        kind: 'ArrowFunction',
        start: cstNode.location.startOffset,
        end: cstNode.location.endOffset,
        pos: cstNode.location.startOffset,
        children: __spreadArrays([].concat.apply([], (_a = lambdaParameters.map(function (e) { return cst_to_ast_1.cstToAst(e); })) !== null && _a !== void 0 ? _a : []), [].concat.apply([], (_b = arrow === null || arrow === void 0 ? void 0 : arrow.map(function (e) { return cst_to_ast_1.cstToAst(e, 'arrow'); })) !== null && _b !== void 0 ? _b : []), [].concat.apply([], (_c = lambdaBody.map(function (e) { return cst_to_ast_1.cstToAst(e); })) !== null && _c !== void 0 ? _c : []))
    };
}
exports.run = run;
