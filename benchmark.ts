import { pooledMap } from "https://deno.land/std/async/mod.ts";

export interface RunResult {
  durationMillis: number;
}

export interface BenchmarkResult {
  totalDurationMillis: number;
  totalExecutions: number;
  averageDurationMillis: number;
  fastestExecutionDurationMillis: number;
  slowestExecutionDurationMillis: number;
}

type BenchmarkOptions = { executions: number; showReturn: boolean; poolSize: number };

export async function benchmarkCommand(
  command: string[],
  { executions, showReturn, poolSize }: BenchmarkOptions
): Promise<BenchmarkResult> {
  return extractBenchmarkResult(
    await runPooledCommand(command, { executions, showReturn, poolSize })
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
  await process.status();
  const endTime = Date.now();
  if (showReturn) {
    await logReturn(process);
  }
  const durationMillis = endTime - startTime;
  return { durationMillis };
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

function extractBenchmarkResult(runResults: RunResult[]): BenchmarkResult {
  let totalDurationMillis = 0;
  let slowestExecutionDurationMillis = 0;
  let fastestExecutionDurationMillis = 0;
  for (const runResult of runResults) {
    totalDurationMillis += runResult.durationMillis;
    if (
      slowestExecutionDurationMillis === 0 ||
      slowestExecutionDurationMillis < runResult.durationMillis
    ) {
      slowestExecutionDurationMillis = runResult.durationMillis;
    }
    if (
      fastestExecutionDurationMillis === 0 ||
      fastestExecutionDurationMillis > runResult.durationMillis
    ) {
      fastestExecutionDurationMillis = runResult.durationMillis;
    }
  }
  return {
    totalDurationMillis,
    slowestExecutionDurationMillis,
    fastestExecutionDurationMillis,
    totalExecutions: runResults.length,
    averageDurationMillis: totalDurationMillis / runResults.length,
  };
}
