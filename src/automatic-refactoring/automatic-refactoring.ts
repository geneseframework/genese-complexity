import { SyntaxKind } from 'ts-morph';

import { AstFolder } from '../json-ast-to-reports/models/ast/ast-folder.model';
import { RefactorProposal } from './models/refactor-proposal.model';
import { Refactorer } from './models/refactorer.model';
// import { BigIfElseRefactorer } from './refactorers/bigIfElse.refactorer';

import { ProjectService } from './services/project.service';
import { UselessElseRefactorer } from './refactorers/uselessElse.refactorer';
import { RefactorReportService } from './services/refactor-report.service';
import { TernaryToNullishCoalescing } from './refactorers/ternaryToCoalescing.refactorer';
import { BigIfElseRefactorer } from './refactorers/bigIfElse.refactorer';

export class AutomaticRefactoring {
    static refactorers: (new (projectService: ProjectService) => Refactorer)[];
    static projectService: ProjectService;


    static setRefactorer(...refactorers: (new (projectService: ProjectService) => Refactorer)[]): void {
        this.refactorers = refactorers;
    }


    static start(commandPath: string, pathToAnalyse: string): void {
        this.projectService = new ProjectService(`${pathToAnalyse}/**/*.ts`)
        this.setRefactorer(BigIfElseRefactorer, UselessElseRefactorer);

        this.refactorFromSourceFile();
        new RefactorReportService(this.projectService.refactorProposals, commandPath).generateRefactorReport();
    }

    static refactorFromSourceFile(): void {
        this.refactorers.forEach((r: new (projectService: ProjectService) => Refactorer) => {
            const REFACTORER = new r(this.projectService);
            REFACTORER.apply();
            this.projectService.addToRefactorProposals(REFACTORER.refactorProposals);
        });
    }
}
