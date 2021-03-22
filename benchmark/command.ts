import { pooledMap } from "https://deno.land/std/async/mod.ts";
import { RunResult, BenchmarkResult } from "./commons.ts";

type BenchmarkOptions = { executions: number; showReturn: boolean; poolSize: number };

export async function benchmarkCommand(
    command: string[],
    { executions, showReturn, poolSize }: BenchmarkOptions
): Promise<BenchmarkResult> {
    return new BenchmarkResult(
        await runPooledCommand(command, { executions, showReturn, poolSize }),
        executions
    );
}

export async function runPooledCommand(
    command: string[],
    { executions, showReturn, poolSize }: BenchmarkOptions
): Promise<RunResult[]> {
    const resultsIterable = pooledMap(poolSize, new Array(executions), (_) =>
        runCommand(command, { showReturn })
    );
    const runResults = [];
    for await (const result of resultsIterable) {
        runResults.push(result);
    }
    return runResults;
}

async function runCommand(
    command: string[],
    { showReturn }: Pick<BenchmarkOptions, "showReturn">
): Promise<RunResult> {
    const startTime = Date.now();
    const process = Deno.run({
        cmd: command,
        stderr: "piped",
        stdout: "piped",
    });
    const initializationTime = Date.now();
    await process.status();
    const endTime = Date.now();
    if (showReturn) {
        await logReturn(process);
    }
    return new RunResult({
        startTime: startTime,
        endTime: endTime,
        initializationDurationMillis: initializationTime - startTime,
    });
}

async function logReturn(process: Deno.Process) {
    const error = new TextDecoder().decode(await process.stderrOutput());
    const result = new TextDecoder().decode(await process.output());
    if (error) {
        console.error("Erro da execução:", error);
    }
    if (result) {
        console.log("Resultado da execução:", result);
    }
}
