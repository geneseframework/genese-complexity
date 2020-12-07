import {
    Block,
    Identifier,
    IfStatement,
    Node,
    ParameterDeclaration,
    SyntaxKind,
    TransformTraversalControl,
    VariableDeclaration,
    ts, printNode, ClassDeclaration
} from 'ts-morph';
import * as tsts from 'typescript';

import { Input } from '../models/input.model';
import { Refactorer } from '../models/refactorer.model';
import { RefactorerUtils } from '../utils/refactorer.utils';
import { ComplexityService } from '../services/complexity.service';
import { randomString } from '../../core/services/tools.service';

export class BigIfElseRefactorer extends Refactorer {
    REFACTORED_NODE_KIND = SyntaxKind.MethodDeclaration;


    refactorNeeded(node: Node): boolean {
        const IF_STATEMENTS = node.getDescendantsOfKind(SyntaxKind.IfStatement);
        return IF_STATEMENTS.some((i: IfStatement) => {
            const BLOCKS = i.getDescendantsOfKind(SyntaxKind.Block);
            return BLOCKS.some((b: Block) => b.compilerNode.statements.length > 5);
        });
    }


    /**
     * Copy current method then transform the copy to get refctored method
     * Put refactored method on current method object
     * @returns {void}
     * @param node
     */
    refactor(node: Node): Node {
        let methods = [];
        let declaredVariables: Input[] = [...node.getDescendantsOfKind(SyntaxKind.Parameter), ...node.getDescendantsOfKind(SyntaxKind.VariableDeclaration)]
            .filter(this.isVariableDeclaration)
            .map((variable: Node) => {
                return {
                    identifier: variable.getFirstDescendantByKind(SyntaxKind.Identifier).getText(),
                    type: printNode((this.projectService.project.getTypeChecker().compilerObject.typeToTypeNode(
                        this.projectService.project.getTypeChecker().compilerObject.getTypeAtLocation(variable.compilerNode),
                        undefined,
                        undefined
                    ) ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)))
                };
            });

        const NODE = node.transform((traversal: TransformTraversalControl) => {
            let currentNode: Node = Refactorer.wrapCurrentNode(node, traversal);
            if (this.isConditionnedBlock(currentNode)) {

                const variableDeclarations = currentNode.getDescendantsOfKind(SyntaxKind.VariableDeclaration).map(e =>
                    e.getFirstDescendantByKind(SyntaxKind.Identifier).getText()
                );
                const neededVariables = declaredVariables.filter(e =>
                    !variableDeclarations.includes(e.identifier) &&
                    currentNode.getDescendantsOfKind(SyntaxKind.Identifier).map(e => e.getText()).includes(e.identifier)
                );
                const neededParameters = neededVariables.map(({identifier, type}) => {
                    return {
                        name: identifier,
                        type: type
                    }
                });

                const containsReturn = currentNode.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
                const returnType = containsReturn
                    ? declaredVariables.find(e => e.identifier === containsReturn?.getFirstDescendantByKind(SyntaxKind.Identifier).getText())?.type ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                    : undefined;

                const methodName = 'methodToRename' + (methods.length + 1);
                const methodLines = currentNode.getChildAtIndex(1).getChildren().map(e => e.print());
                const method = {
                    name: methodName,
                    statements: methodLines,
                    params: neededParameters,
                    type: containsReturn
                        ? declaredVariables.find(e => e.identifier === containsReturn?.getFirstDescendantByKind(SyntaxKind.Identifier).getText())?.type ?? 'any'
                        : undefined
                }
                methods.push(method);
                const callArgs = neededVariables.map(e => ts.factory.createIdentifier(e.identifier));
                const methodCall = RefactorerUtils.createMethodCall(methodName, callArgs);
                const statement = containsReturn ? ts.factory.createReturnStatement(methodCall) : ts.factory.createExpressionStatement(methodCall);

                return ts.factory.createBlock([statement]);
            }
            return currentNode.compilerNode;
        });
        this.addMethodToClass(NODE, methods);
        return NODE;
    }


    private addMethodToClass(node: Node, methods: any[]): void {
        this.addTransformer({
            baseNode: node,
            nodeMethod: 'getParent',
            transformer: (transformNode) => {
                const names = methods.map(e => e.name);
                const classDeclaration = transformNode as ClassDeclaration
                methods.forEach(method => {
                    classDeclaration.addMethod({
                        name: method.name,
                        statements: method.statements,
                        returnType: method.type,
                        parameters: method.params
                    })
                })
                methods = [];
                return classDeclaration.getMethods().filter(e => names.includes(e.getName())).map(e => {
                    return {
                        name: e.getName(),
                        cpx: ComplexityService.getCpxFromSourceCode(e.print())
                    }
                });
            }
        });
    }


    private isConditionnedBlock(node: Node): node is Block {
        return node.getParent() && Node.isIfStatement(node.getParent()) && Node.isBlock(node) && node.getStatements().length > 5;
    }


    private isVariableDeclaration(node: Node): node is ParameterDeclaration | VariableDeclaration {
        return (Node.isParameterDeclaration(node) && !Node.isArrowFunction(node.getParent())) || Node.isVariableDeclaration(node);
    }
}
