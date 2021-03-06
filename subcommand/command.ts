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

export class CommandSubCommand implements Command<string, CommandOptions> {
    async execute(
        command: string,
        { executions, poolSize, showReturn, detailed }: CommandOptions
    ): Promise<void> {
        console.log("Iniciando benchmark...");

        const benchmarkResult: BenchmarkResult = await benchmarkCommand(command.split(" "), {
            executions,
            showReturn,
            poolSize,
        });

        this.logResult(benchmarkResult);
        if (detailed) {
            this.logDetails(benchmarkResult);
        }

        console.log("Benchmark finalizado!");
    }

    private logResult(benchmarkResult: BenchmarkResult): void {
        new TablePrinter()
            .setHeaders("Duração total", "Duração média", "Menor duração", "Maior duração")
            .addRow(
                `${benchmarkResult.totalDurationMillis}ms`,
                `${benchmarkResult.averageDurationMillis.toFixed(2)}ms`,
                `${benchmarkResult.fastestExecutionDurationMillis}ms`,
                `${benchmarkResult.slowestExecutionDurationMillis}ms`
            )
            .print();
    }

    private logDetails(benchmarkResult: BenchmarkResult): void {
        const detailsPrinter = new TablePrinter().setHeaders(
            "Duração",
            "Tempo de inicialização",
            "Início",
            "Fim"
        );
        for (const runResult of benchmarkResult.runResults) {
            detailsPrinter.addRow(
                `${runResult.durationMillis}ms`,
                `${runResult.initializationDurationMillis}ms`,
                `${formatDate(new Date(runResult.startTime), "HH:mm:ss.SSS")}`,
                `${formatDate(new Date(runResult.endTime), "HH:mm:ss.SSS")}`
            );
        }
        console.log("Detalhes das execuções");
        detailsPrinter.print();
    }
}
