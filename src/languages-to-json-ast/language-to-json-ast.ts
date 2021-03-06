import { InitGenerationService } from './init-generation.service';
import { Language } from '../core/enum/language.enum';
import * as chalk from 'chalk';
import { JsonService } from './json.service';
import { createFile } from '../core/services/file.service';
import { JsonAstInterface } from '../core/interfaces/ast/json-ast.interface';
import { project } from './globals.const';
import { Project } from 'ts-morph';
import { AstFileGenerationService } from './ts/services/ast-file-generation.service';
import { AstNodeInterface } from '../core/interfaces/ast/ast-node.interface';

/**
 * Main process of the parsing to JsonAst format
 */
export class LanguageToJsonAst {

    /**
     * Starts the parsing to Json Ast format
     * @param  {string} pathToAnalyze          // The path of the folder to analyse
     * @param  {Language} language?         // The language to parse and convert into JsonAst
     * @returns void
     */
    static start(pathToAnalyze: string, language?: Language): void {
        let jsonAst: JsonAstInterface;
        const path = pathToAnalyze.slice(-1) === '/' ? pathToAnalyze.slice(0, -1) : pathToAnalyze;
        switch (language) {
            case Language.TS:
                project.addSourceFilesAtPaths(`${path}/**/*.ts`);
                jsonAst = LanguageToJsonAst.generateFromFiles(pathToAnalyze, language);
                break
            case Language.JAVA:
                jsonAst = LanguageToJsonAst.generateFromFiles(pathToAnalyze, language);
                break;
            case Language.JS:
                project.addSourceFilesAtPaths(`${path}/**/*.js`);
                jsonAst = LanguageToJsonAst.generateFromFiles(pathToAnalyze, language);
                break;
            case Language.TSX:
                project.addSourceFilesAtPaths(`${path}/**/*.tsx`);
                jsonAst = LanguageToJsonAst.generateFromFiles(pathToAnalyze, language);
                break;
            case Language.JSX:
                project.addSourceFilesAtPaths(`${path}/**/*.jsx`);
                jsonAst = LanguageToJsonAst.generateFromFiles(pathToAnalyze, language);
                break;
            default:
                jsonAst = LanguageToJsonAst.generateFromAllFiles(pathToAnalyze);
                break;
        }
        createFile(`./json-ast.json`, JsonService.prettifyJson(jsonAst));
    }


    // TODO: implement for all languages
    private static generateFromAllFiles(pathToAnalyze: string): JsonAstInterface {
        return LanguageToJsonAst.generateFromFiles(pathToAnalyze, Language.TS);
    }

    /**
     * Generate AST for Ts or Java files
     * @param  {string} pathToAnalyze
     * @param  {Language} language
     * @returns JsonAstInterface
     */
    private static generateFromFiles(pathToAnalyze: string, language: Language): JsonAstInterface {
        const jsonAst: JsonAstInterface = {
            astFolder: undefined
        };
        let astFolder = new InitGenerationService().generateAll(pathToAnalyze, language).astFolder as any;
        astFolder = JsonService.astPropertyNames(astFolder);
        jsonAst.astFolder = astFolder;
        return jsonAst;
    }

    private static findInObject(o, f) {
        return Object.keys(o).some(function (a) {
            if (Array.isArray(o[a]) || typeof o[a] === 'object' && o[a] !== null) {
                return LanguageToJsonAst.findInObject(o[a], f);
            }
            return o[a] === f;
        });
    }


}
