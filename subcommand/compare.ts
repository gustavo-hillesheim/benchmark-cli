import { Command } from "../types.ts";
import { TablePrinter } from "../table_printer.ts";
import { benchmarkCommand } from "../benchmark/command.ts";
import { BenchmarkResult } from "../benchmark/commons.ts";
import { format as formatDate } from "https://deno.land/x/std@0.91.0/datetime/mod.ts";

type CommandOptions = {
    showReturn: boolean;
    detailed: boolean;
    executions: number;
    poolSize: number;
};

export class CompareSubCommand implements Command<string[], CommandOptions> {
    async execute(
        commands: string[],
        { executions, poolSize, showReturn, detailed }: CommandOptions
    ): Promise<void> {
        console.log("Iniciando benchmarks...");

        const benchmarkResultsByCommand: Map<string, BenchmarkResult> = new Map();

        for (const command of commands) {
            const benchmarkResult: BenchmarkResult = await benchmarkCommand(command.split(" "), {
                executions,
                showReturn,
                poolSize,
            });
            benchmarkResultsByCommand.set(command, benchmarkResult);
        }

        this.logResults(benchmarkResultsByCommand);
        if (detailed) {
            this.logDetails(benchmarkResultsByCommand);
        }

        console.log("Benchmarks finalizados!");
    }

    private logResults(benchmarkResultsByCommand: Map<string, BenchmarkResult>): void {
        const resultsPrinter = new TablePrinter().setHeaders(
            "Comando",
            "Duração total",
            "Duração média",
            "Menor duração",
            "Maior duração"
        );

        benchmarkResultsByCommand.forEach((benchmarkResult, command) => {
            resultsPrinter.addRow(
                command,
                `${benchmarkResult.totalDurationMillis}ms`,
                `${benchmarkResult.averageDurationMillis}ms`,
                `${benchmarkResult.fastestExecutionDurationMillis}ms`,
                `${benchmarkResult.slowestExecutionDurationMillis}ms`
            );
        });

        resultsPrinter.print();
    }

    private logDetails(benchmarkResultsByCommand: Map<string, BenchmarkResult>): void {
        const detailsPrinter = new TablePrinter().setHeaders(
            "Duração",
            "Tempo de inicialização",
            "Início",
            "Fim"
        );

        benchmarkResultsByCommand.forEach((benchmarkResult, command) => {
            detailsPrinter.clearRows();
            for (const runResult of benchmarkResult.runResults) {
                detailsPrinter.addRow(
                    `${runResult.durationMillis}ms`,
                    `${runResult.initializationDurationMillis}ms`,
                    `${formatDate(new Date(runResult.startTime), "HH:mm:ss.SSS")}`,
                    `${formatDate(new Date(runResult.endTime), "HH:mm:ss.SSS")}`
                );
            }

            console.log(`Detalhes do benchmark de "${command}"`);
            detailsPrinter.print();
        });
    }
}
