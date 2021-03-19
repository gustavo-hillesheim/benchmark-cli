export class RunResult {
    constructor(public durationMillis: number) {}
}

export class BenchmarkResult {
    totalDurationMillis = 0;
    averageDurationMillis = 0;
    fastestExecutionDurationMillis = 0;
    slowestExecutionDurationMillis = 0;

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