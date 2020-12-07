import { Block, ts } from 'ts-morph';


export class RefactorerUtils {
    /**
     * Simple way to create method node
     * @param name the method name
     * @param block the method block node
     * @param parameters the method parameters
     * @param type
     * @returns {ts.MethodDeclaration}
     */
    static createSimpleMethod(name: string, block: ts.Block, parameters: ts.ParameterDeclaration[] = [], type?: ts.TypeNode): ts.MethodDeclaration {
        return ts.factory.createMethodDeclaration(undefined, undefined, undefined, name, undefined, undefined, parameters, type, block);
    }

    /**
     * Simple way to create a parameter
     * @param identifier the parameter name
     * @param type the parameter type
     * @returns {ts.ParameterDeclaration}
     */
    static createSimpleParameter(identifier: string, type: ts.TypeNode): ts.ParameterDeclaration {
        return ts.factory.createParameterDeclaration([], [], undefined, identifier, undefined, type);
    }

    /**
     * Simple way to create a method call
     * @param name the method to call name
     * @param parameters the passed parameters
     * @returns {ts.CallExpression}
     */
    static createMethodCall(name: string, parameters: ts.Expression[] = []): ts.CallExpression {
        return ts.factory.createCallExpression(ts.factory.createPropertyAccessChain(ts.factory.createThis(), undefined, ts.factory.createIdentifier(name)), [], parameters);
    }
}
