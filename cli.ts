import { Program } from "https://deno.land/x/program@0.1.6/mod.ts";
import { benchmarkCommand } from "./benchmark/command.ts";
import { BenchmarkResult } from "./benchmark/commons.ts";
import { TablePrinter } from "./table_printer.ts";

const cli = new Program({
    name: "benchmark",
    description: "CLI para realização de benchmark de aplicações executadas por terminal",
});

cli.command({
    name: "command",
    description: "Faz o benchmark de um determinado comando",
    options: {
        executions: {
            name: "executions",
            alias: "e",
            description: "Quantidade de vezes que o comando será executado",
        },
        showReturn: {
            name: "showReturn",
            alias: "r",
            description:
                "Mostra o retorno dos comandos executados. Recomendado para verificar se o comando está executando corretamente",
            boolean: true,
        },
        poolSize: {
            name: "poolSize",
            alias: "p",
            description: "Quantidade de execuções que podem rodar em paralelo",
        },
        detailed: {
            name: "detailed",
            alias: "d",
            description: "Indica que devem ser mostrados os detalhes de cada execução",
        },
    },
    args: [
        {
            name: "command",
            description: "Comando que será executado",
            multiple: true,
            optional: false,
        },
    ],
    fn: async (args) => {
        const executions = args.executions || 1;
        const poolSize = args.poolSize || 1;
        const showReturn = args.showReturn;
        const detailed = args.detailed;
        const command = (args._ as string[])
            .map((commandSegment) => new String(commandSegment).split(" "))
            .reduce((command, newSegments) => [...command, ...newSegments], []);

        console.log("Iniciando benchmark...");

        const benchmarkResult: BenchmarkResult = await benchmarkCommand(command, {
            executions,
            showReturn,
            poolSize,
        });

        new TablePrinter()
            .setHeaders("Duração total", "Duração média", "Menor duração", "Maior duração")
            .addRow(
                `${benchmarkResult.totalDurationMillis}ms`,
                `${benchmarkResult.averageDurationMillis.toFixed(2)}ms`,
                `${benchmarkResult.fastestExecutionDurationMillis}ms`,
                `${benchmarkResult.slowestExecutionDurationMillis}ms`
            )
            .print();

        if (detailed) {
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
                    `${new Date(runResult.startTime).toUTCString()}`,
                    `${new Date(runResult.endTime).toUTCString()}`
                );
            }
            console.log("Detalhes das execuções");
            detailsPrinter.print();
        }

        console.log("Benchmark finalizado!");
    },
});

cli.parse(Deno.args);
