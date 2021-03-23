export class TablePrinter {
    private static TOP_LEFT_CORNER = "┌";
    private static TOP_RIGHT_CORNER = "┐";
    private static BOTTOM_LEFT_CORNER = "└";
    private static BOTTOM_RIGHT_CORNER = "┘";
    private static HORIZONTAL_BAR = "─";
    private static VERTICAL_BAR = "│";
    private static LEFT_VERTICAL_DIVIDER = "├";
    private static RIGHT_VERTICAL_DIVIDER = "┤";
    private static TOP_HORIZONTAL_DIVIDER = "┬";
    private static BOTTOM_HORIZONTAL_DIVIDER = "┴";
    private static CENTER_DIVIDER = "┼";
    private static CELL_PADDING = 1;

    private headers: string[] = [];
    private rows: string[][] = [];

    setHeaders(...headers: string[]): TablePrinter {
        this.headers = headers;
        return this;
    }

    addRow(...cells: string[]): TablePrinter {
        if (cells.length > this.headers.length) {
            throw new Error("Não é possível definir uma linha com mais células do que headers");
        }
        this.rows.push(cells);
        return this;
    }

    clearRows(): TablePrinter {
        this.rows = [];
        return this;
    }

    print(): void {
        const cellSizes = this.calculateCellsSizes();
        this.printHeaders(cellSizes);
        this.printRows(cellSizes);
    }

    private calculateCellsSizes(): number[] {
        const cellsSizes = [];
        for (let i = 0; i < this.headers.length; i++) {
            cellsSizes.push(this.headers[i].length);
        }
        for (const row of this.rows) {
            for (let i = 0; i < row.length; i++) {
                const rowCell = row[i];
                if (rowCell.length > cellsSizes[i]) {
                    cellsSizes[i] = rowCell.length;
                }
            }
        }
        return cellsSizes;
    }

    private printHeaders(cellSizes: number[]): void {
        this.printRowDivider(cellSizes, { isFirstRow: true });
        let headersString = "";
        for (let i = 0, l = this.headers.length; i < l; i++) {
            const isLastHeader = i === l - 1;
            const cellSize = cellSizes[i];
            const header = this.addPaddingAndAlignment(this.headers[i], {
                cellSize,
                alignment: "left",
            });
            headersString += TablePrinter.VERTICAL_BAR + header;
            if (isLastHeader) {
                headersString += TablePrinter.VERTICAL_BAR;
            }
        }
        console.log(headersString);
        this.printRowDivider(cellSizes);
    }

    private printRows(cellSizes: number[]): void {
        for (let i = 0, l = this.rows.length; i < l; i++) {
            const isLastRow = i === l - 1;
            const rowData = this.rows[i];
            let rowString = "";
            for (let ri = 0, rl = rowData.length; ri < rl; ri++) {
                const isLastCell = ri === rl - 1;
                const cellSize = cellSizes[ri];
                const cellValue = this.addPaddingAndAlignment(rowData[ri], {
                    cellSize,
                });
                rowString += TablePrinter.VERTICAL_BAR + cellValue;
                if (isLastCell) {
                    rowString += TablePrinter.VERTICAL_BAR;
                }
            }
            console.log(rowString);
            this.printRowDivider(cellSizes, { isLastRow });
        }
    }

    private printRowDivider(
        cellSizes: number[],
        { isFirstRow, isLastRow }: { isFirstRow?: boolean; isLastRow?: boolean } = {
            isFirstRow: false,
            isLastRow: false,
        }
    ): void {
        let rowDivider = this.getRowDividerLeftCorner({ isFirstRow, isLastRow });
        for (let i = 0, l = cellSizes.length; i < l; i++) {
            const isLastCell = i === l - 1;
            const cellSize = cellSizes[i];
            const cellCover = new Array(cellSize + TablePrinter.CELL_PADDING * 2 + 1).join(
                TablePrinter.HORIZONTAL_BAR
            );
            rowDivider += cellCover;
            if (!isLastCell) {
                rowDivider += this.getCellDivider({ isFirstRow, isLastRow });
            }
        }
        rowDivider += this.getRowDividerRightCorner({ isFirstRow, isLastRow });
        console.log(rowDivider);
    }

    private getRowDividerLeftCorner({ isFirstRow = false, isLastRow = false }): string {
        if (isFirstRow) {
            return TablePrinter.TOP_LEFT_CORNER;
        }
        if (isLastRow) {
            return TablePrinter.BOTTOM_LEFT_CORNER;
        }
        return TablePrinter.LEFT_VERTICAL_DIVIDER;
    }

    private getCellDivider({ isFirstRow = false, isLastRow = false }): string {
        if (isFirstRow) {
            return TablePrinter.TOP_HORIZONTAL_DIVIDER;
        }
        if (isLastRow) {
            return TablePrinter.BOTTOM_HORIZONTAL_DIVIDER;
        }
        return TablePrinter.CENTER_DIVIDER;
    }

    private getRowDividerRightCorner({ isFirstRow = false, isLastRow = false }): string {
        if (isFirstRow) {
            return TablePrinter.TOP_RIGHT_CORNER;
        }
        if (isLastRow) {
            return TablePrinter.BOTTOM_RIGHT_CORNER;
        }
        return TablePrinter.RIGHT_VERTICAL_DIVIDER;
    }

    private addPaddingAndAlignment(
        cellValue: string,
        { cellSize, alignment }: { cellSize: number; alignment?: "left" | "right" }
    ): string {
        const leftEmptySpaceSize =
            TablePrinter.CELL_PADDING + (alignment !== "left" ? cellSize - cellValue.length : 0);
        const leftEmptySpace = new Array(leftEmptySpaceSize + 1).join(" ");
        const rightEmptySpaceSize =
            TablePrinter.CELL_PADDING + (alignment === "left" ? cellSize - cellValue.length : 0);
        const rightEmptySpace = new Array(rightEmptySpaceSize + 1).join(" ");
        return leftEmptySpace + cellValue + rightEmptySpace;
    }
}
