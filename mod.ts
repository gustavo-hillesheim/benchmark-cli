import { Program } from "https://deno.land/x/program@0.1.6/mod.ts";
import { benchmarkCommand } from "./benchmark.ts";

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
      alias: "sr",
      description:
        "Mostra o retorno dos comandos executados. Recomendado para verificar se o comando está executando corretamente",
      boolean: true,
    },
    poolSize: {
      name: "poolSize",
      alias: "ps",
      description: "Quantidade de execuções que podem rodar em paralelo",
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
    const command = (args._ as string[])
      .map((commandSegment) => new String(commandSegment).split(" "))
      .reduce((command, newSegments) => [...command, ...newSegments], []);

    console.log("Iniciando benchmark...\n");

    const {
      totalExecutions,
      totalDurationMillis,
      averageDurationMillis,
      slowestExecutionDurationMillis,
      fastestExecutionDurationMillis,
    } = await benchmarkCommand(command, { executions, showReturn, poolSize });

    console.log(`Total de execuções: ${totalExecutions}`);
    console.log(`Duração total: ${totalDurationMillis}ms`);
    console.log(`Duração média: ${averageDurationMillis.toFixed(2)}ms`);
    console.log(`Duração da execução mais lenta: ${slowestExecutionDurationMillis}ms`);
    console.log(`Duração da execução mais rápida: ${fastestExecutionDurationMillis}ms`);
    console.log("\nBenchmark finalizado!");
  },
});

cli.parse(Deno.args);
