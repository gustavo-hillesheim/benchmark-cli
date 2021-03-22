import { Fields } from "../types.ts";

export class RunResult {
    public initializationDurationMillis: number;
    public startTime: number;
    public endTime: number;
    public durationMillis: number;

    constructor(params: Fields<Omit<RunResult, "durationMillis">>) {
        this.initializationDurationMillis = params.initializationDurationMillis;
        this.startTime = params.startTime;
        this.endTime = params.endTime;
        this.durationMillis = params.endTime - params.startTime;
    }
}

export class BenchmarkResult {
    public totalDurationMillis = 0;
    public averageDurationMillis = 0;
    public fastestExecutionDurationMillis = 0;
    public slowestExecutionDurationMillis = 0;

    constructor(public runResults: RunResult[], public totalExecutions: number) {
        this.extractDurationData(runResults);
        this.averageDurationMillis = this.totalDurationMillis / totalExecutions;
    }

    private extractDurationData(runResults: RunResult[]): void {
        for (const runResult of runResults) {
            this.totalDurationMillis += runResult.durationMillis;
            if (
                this.slowestExecutionDurationMillis === 0 ||
                this.slowestExecutionDurationMillis < runResult.durationMillis
            ) {
                this.slowestExecutionDurationMillis = runResult.durationMillis;
            }
            if (
                this.fastestExecutionDurationMillis === 0 ||
                this.fastestExecutionDurationMillis > runResult.durationMillis
            ) {
                this.fastestExecutionDurationMillis = runResult.durationMillis;
            }
        }
    }
}
