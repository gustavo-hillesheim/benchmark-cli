import { Program } from "https://deno.land/x/program@0.1.6/mod.ts";
import { CommandSubCommand } from "./subcommand/command.ts";
import { CompareSubCommand } from "./subcommand/compare.ts";

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
            description: "Quantidade de execuções que podem ser executadas em paralelo",
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
        const executions: number = args.executions || 1;
        const poolSize: number = args.poolSize || 1;
        const showReturn: boolean = args.showReturn;
        const detailed: boolean = args.detailed;
        const command: string = (args._ as string[]).join(" ");

        await new CommandSubCommand().execute(command, {
            executions,
            poolSize,
            showReturn,
            detailed,
        });
    },
});

cli.command({
    name: "compare",
    description: "Faz o benchmarks dos comandos e compara os resultados",
    options: {
        executions: {
            name: "executions",
            alias: "e",
            description: "Quantidade de vezes que os comandos serão executados",
        },
        showReturn: {
            name: "showReturn",
            alias: "r",
            description:
                "Mostra o retorno dos comandos executados. Recomendado para verificar se os comandos estão executando corretamente",
            boolean: true,
        },
        poolSize: {
            name: "poolSize",
            alias: "p",
            description: "Quantidade de execuções que podem ser executadas em paralelo",
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
        const executions: number = args.executions || 1;
        const poolSize: number = args.poolSize || 1;
        const showReturn: boolean = args.showReturn;
        const detailed: boolean = args.detailed;
        const commands: string[] = args._ as string[];

        await new CompareSubCommand().execute(commands, {
            executions,
            poolSize,
            showReturn,
            detailed,
        });
    },
});

cli.parse(Deno.args);
