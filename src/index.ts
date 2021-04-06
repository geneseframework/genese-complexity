#!/usr/bin/env node

import {Worker} from 'worker_threads';
import { Options } from './core/models/options.model';
import { createOutDir, deleteFile } from './core/services/file.service';
import { AstFolder } from './json-ast-to-reports/models/ast/ast-folder.model';
import { Language } from './core/enum/language.enum';
import * as chalk from 'chalk';
import { LanguageToJsonAst } from './languages-to-json-ast/language-to-json-ast';
import { JsonAstToReports } from './json-ast-to-reports/json-ast-to-reports';

const ora = require('ora');
const path = require('path');

const spinner = ora();

const ARGS: string[] = process.argv.slice(2);
const PATH_TO_ANALYSE = ARGS[0] ?? '.';
const LANGUAGE = ARGS[1] ?? 'ts';
const ENABLE_MARKDOWN_REPORT = ARGS[2] === 'true';
const ENABLE_CONSOLE_REPORT = ARGS[3] === 'true';
const ENABLE_REFACTORING = ARGS[4] === 'true';

console.log(chalk.yellowBright('PATH_TO_ANALYSE'), PATH_TO_ANALYSE);
let pathToAnalyse: string;
if (path.isAbsolute(PATH_TO_ANALYSE)) {
    pathToAnalyse = PATH_TO_ANALYSE;
} else {
    pathToAnalyse = `${process.cwd()}/${PATH_TO_ANALYSE}`.split('/').filter(e => e !== '.').join('/');
}
console.log(chalk.yellowBright('pathToAnalyse'), pathToAnalyse);


start()
    .then(exitCode => {
        process.exit(exitCode)
    })
    .catch(err => {
        spinner.fail();
        console.log(err);
    })

async function start(): Promise<number> {
    Options.setOptions(process.cwd(), pathToAnalyse, __dirname);
    if (!ENABLE_CONSOLE_REPORT) {
        createOutDir();
    }

    spinner.start('AST generation');
    generateJsonAst();
    spinner.succeed();
    spinner.start('Report generation');
    generateReport();
    spinner.succeed();
    return 0;
}


function generateJsonAst(): void {
    Options.setOptions(process.cwd(), pathToAnalyse, __dirname);
    LanguageToJsonAst.start(Options.pathFolderToAnalyze, LANGUAGE as Language);
}


function generateReport(): void {
    JsonAstToReports.start(Options.pathCommand, undefined, ENABLE_MARKDOWN_REPORT, ENABLE_CONSOLE_REPORT);
}
