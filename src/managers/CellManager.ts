import { Cell } from '../image/Cell';
import { BaseImageAdapter } from '../image/adapters/BaseImageAdapter';
import fs from 'fs';
import path from 'path';

/**
 * Class responsible for managing Cell instances.
 * Implements Factory and Repository design patterns.
 */
class CellManager {
  private cells: Cell[] = [];

  public CellManager(cells: Cell[] = []) {
    this.cells = cells;
  }

  /**
   * Adds a Cell to the manager.
   * @param cell - The Cell instance to add.
   */
  public addCell(cell: Cell): void {
    this.cells.push(cell);
  }

  /**
   * Retrieves a Cell based on its x and y coordinates.
   * @param x - The x-coordinate of the Cell.
   * @param y - The y-coordinate of the Cell.
   * @returns The corresponding Cell or undefined if not found.
   */
  public getCell(x: number, y: number): Cell | undefined {
    return this.cells.find(cell => cell.x === x && cell.y === y);
  }

  /**
   * Removes a specific Cell from the manager.
   * @param cell - The Cell instance to remove.
   */
  public removeCell(cell: Cell): void {
    this.cells = this.cells.filter(c => c !== cell);
  }

  public clearCells(): void {
    this.cells = [];
  }

  /**
   * Creates and partitions Cells from an image using the provided adapter and cell dimensions.
   * @param imageAdapter - The image adapter to use for retrieving image data.
   * @param cellWidth - The width of each Cell.
   * @param cellHeight - The height of each Cell.
   */
  public async partitionCellsFromImage(imageAdapter: BaseImageAdapter, cellWidth?: number, cellHeight?: number): Promise<Cell[]> {
    const metadata = await imageAdapter.getMetadata();
    const width = (await imageAdapter.getImageData()).width;
    const height = (await imageAdapter.getImageData()).height;

    // Calculate cell dimensions based on image size
    if (!cellWidth) {
      cellWidth = Math.floor(width / 5);
    }

    if (!cellHeight) {
      cellHeight = Math.floor(height / 5);
    }
    if (!width || !height) return []; // Guard for empty metadata

    // Loop through the image and create cells
    for (let y = 0; y < height; y += cellHeight) {
      for (let x = 0; x < width; x += cellWidth) {
        const cell: Cell = new Cell(
          x,
          y,
          Math.min(cellWidth, width - x),
          Math.min(cellHeight, height - y),
          imageAdapter
        );
        if (await cell.hasPixels()) {
          this.cells.push(cell);
        }
      }
    }

    return this.cells;
  }

  /**
   * Saves each cell's image data to a file in the "output" directory.
   * @param outputDir - The directory where the images will be saved.
   */
  public async saveCellsToImages(imageAdapter: BaseImageAdapter, outputDir: string): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const width = (await imageAdapter.getImageData()).width;
    const cellWidth = this.cells[0].width;

    // Caculate the number of cells per row
    const cellsPerRow = Math.floor(width / cellWidth);

    for (let i = 0; i < this.cells.length; i++) {
      // When we reach the end of the row, increment y and reset x
      const x = i % cellsPerRow + 1;
      const y = Math.floor(i / cellsPerRow);

      const cell = this.cells[i];
      const cellImageData = await cell.getImageData();
      const cellAdapter = await imageAdapter.fromImageData(cellImageData);
      const outputPath = path.join(outputDir, `cell_${y}_${x}.png`);
      await cellAdapter.toFile(outputPath);
    }
  }
  // Additional methods for managing cells
}

export default CellManager;
