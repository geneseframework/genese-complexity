import * as fs from 'fs-extra';
import { getArrayOfPathsWithDotSlash, getPathWithSlash, } from '../services/file.service';
import { Complexity } from '../../json-ast-to-reports/interfaces/complexity.interface';
import { ComplexityType } from '../../json-ast-to-reports/enums/complexity-type.enum';
import { ChartColor } from '../../json-ast-to-reports/enums/chart-color.enum';
import { ComplexitiesByStatus } from '../../json-ast-to-reports/interfaces/complexities-by-status.interface';

export var WINDOWS = false;

/**
 * The options used by genese-complexity
 * Some options can be override by command-line options or with geneseconfig.json
 */
export class Options {

    static cognitiveCpx: Complexity = { // Options concerning the cognitive complexity
        errorThreshold: 20, // A complexity strictly greater than errorThreshold will be seen as error (can be overriden)
        type: ComplexityType.COGNITIVE, // Sets the complexity type for this option (can't be overriden)
        warningThreshold: 10, // A complexity strictly greater than warning threshold and lower or equal than errorThreshold will be seen as warning (can be overriden)
    };
    static colors: ChartColor[] = [ // The colors of the charts
        ChartColor.CORRECT,
        ChartColor.WARNING,
        ChartColor.ERROR,
    ];
    static cyclomaticCpx: Complexity = { // Options concerning the cognitive complexity
        errorThreshold: 10, // A complexity strictly greater than errorThreshold will be seen as error (can be overriden)
        type: ComplexityType.CYCLOMATIC, // Sets the complexity type for this option (can't be overriden)
        warningThreshold: 5, // A complexity strictly greater than warning threshold and lower or equal than errorThreshold will be seen as warning (can be overriden)
    };
    static ignore: string[] = []; // The paths of the files or folders to ignore
    static ignoreRegex: string = '';
    static pathCommand = ''; // The path of the folder where the command-line was entered (can't be overriden)
    static pathFolderToAnalyze = './'; // The path of the folder to analyse (can be overriden)
    static pathGeneseNodeJs = ''; // The path of the node_module Genese in the nodejs user environment (can't be overriden)
    static pathOutDir = ''; // The path where the reports are created (can be overriden)


    /**
     * Sets the options of genese-complexity module
     * @param pathCommand               // The path of the folder where the command-line was entered (can't be overriden)
     * @param pathFolderToAnalyze       // The path of the folder to analyse (can be overriden)
     * @param pathGeneseNodeJs          // The path of the node_module Genese in the nodejs user environment (can't be overriden)
     */
    static setOptions(
        pathCommand: string,
        pathFolderToAnalyze: string,
        pathGeneseNodeJs: string
    ): void {
        WINDOWS = process.platform === 'win32';
        const geneseConfigPath = `${pathCommand}/geneseconfig.json`;
        if (fs.existsSync(geneseConfigPath)) {
            Options.setOptionsFromConfig(geneseConfigPath);
        }
        Options.setOptionsFromCommandLine(
            pathCommand,
            pathFolderToAnalyze,
            pathGeneseNodeJs
        );
    }


    /**
     * Sets the options of genese-complexity module with command-line options (lower priority than geneseconfig.json options)
     * @param pathCommand               // The path of the folder where the command-line was entered (can't be overriden)
     * @param pathFolderToAnalyze       // The path of the folder to analyse (can be overriden)
     * @param pathGeneseNodeJs          // The path of the node_module Genese in the nodejs user environment (can't be overriden)
     */
    static setOptionsFromCommandLine(pathCommand: string, pathFolderToAnalyze: string, pathGeneseNodeJs: string): void {
        Options.pathCommand = pathCommand;
        Options.pathFolderToAnalyze = getPathWithSlash(pathFolderToAnalyze);
        Options.pathGeneseNodeJs = pathGeneseNodeJs;
        Options.pathOutDir = `${pathCommand}/genese/complexity/reports`;
    }


    /**
     * Sets the options of genese-complexity module with geneseconfig.json options (higher priority than geneseconfig.json options)
     * @param geneseConfigPath  // The path of the geneseconfig.json file
     */
    static setOptionsFromConfig(geneseConfigPath: string): void {
        const config = require(geneseConfigPath);

        Options.ignore = this.filterIgnorePathsForDotSlash(config.complexity.ignore) ?? Options.ignore;
        Options.ignore.forEach((path, i) => {
            Options.ignoreRegex += i !== Options.ignore.length - 1 ? `${this.pathTransformator(path)}|` : `${this.pathTransformator(path)}`;
        });

        Options.pathFolderToAnalyze =
            config.complexity?.pathFolderToAnalyze ??
            Options.pathFolderToAnalyze;
        Options.pathOutDir =
            config.complexity?.pathReports ?? Options.pathOutDir;
        Options.ignore.push(Options.pathOutDir);
        Options.cognitiveCpx = config.complexity.cognitiveCpx ?? Options.cognitiveCpx;
        Options.cyclomaticCpx = config.complexity.cyclomaticCpx ?? Options.cyclomaticCpx;
    }


    /**
     * Separate paths which needs to start by "./" and others
     * @param ignorePaths
     * @returns {String[]}
     */
    static filterIgnorePathsForDotSlash(ignorePaths: string[]): string[] {
        const ignorePathsToFormat = ignorePaths.filter(
            (x) => !x.startsWith('*.')
        );
        const ignorePathsToKeep = ignorePaths.filter((x) => x.startsWith('*.'));
        return getArrayOfPathsWithDotSlash(ignorePathsToFormat).concat(
            ignorePathsToKeep
        );
    }


    /**
     * Checks if a file or a folder is ignored in geneseconfig.json
     * @param path
     */
    static isIgnored(path: string): boolean {
        if (Options.ignoreRegex.length > 0) {
            return path.match(Options.ignoreRegex)?.length > 0;
        } else {
            return false;
        }
    }

    static pathTransformator(path: string) {
        const SEPARATED_PATH = path.split('/');
        let pathTester = '';
        SEPARATED_PATH.forEach((subPath, i) => {
            if (subPath.startsWith('*.')) {
                subPath = subPath.split('.').join('\\.');
                pathTester = subPath.replace('*\\.', '[a-z]*\\.');
            } else {
                if (subPath.match('([a-z].*)')) {
                    i !== SEPARATED_PATH.length - 1
                        ? (pathTester += `${subPath}\\/`)
                        : (pathTester += `${subPath}`);
                }

                if (subPath.match('(\\*\\*)') || subPath.match('(\\*)')) {
                    i !== SEPARATED_PATH.length - 1
                        ? (pathTester += '([a-z].*)\\/')
                        : (pathTester += '([a-z].*)');
                }

                if (subPath.match('(\\.$)')) {
                    i !== SEPARATED_PATH.length - 1
                        ? (pathTester += `${subPath}\\/`)
                        : (pathTester += subPath);
                }
            }
        });
        return pathTester;
    }


    static handleStarPath(ignorePath: string, path: string) {
        if (ignorePath.startsWith('*.')) {
            return path.includes(ignorePath.slice(1));
        }
        return false;
    }


    /**
     * Gets the different thresholds defined in Options class
     * @returns {ComplexitiesByStatus}
     */
    static getThresholds(): ComplexitiesByStatus {
        const cpxByStatus = new ComplexitiesByStatus();
        cpxByStatus.cognitive.warning = Options.cognitiveCpx.warningThreshold;
        cpxByStatus.cognitive.error = Options.cognitiveCpx.errorThreshold;
        cpxByStatus.cyclomatic.warning = Options.cyclomaticCpx.warningThreshold;
        cpxByStatus.cyclomatic.error = Options.cyclomaticCpx.errorThreshold;
        return cpxByStatus;
    }
}
