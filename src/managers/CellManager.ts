import { Cell } from '../image/Cell';
import { BaseImageAdapter } from '../image/adapters/BaseImageAdapter';

/**
 * Singleton class responsible for managing Cell instances.
 * Implements Singleton, Factory, and Repository design patterns.
 */
class CellManager {
  private static instance: CellManager;
  private cells: Cell[] = [];

  // Private constructor to enforce Singleton pattern
  private constructor() {}

  /**
   * Retrieves the single instance of CellManager.
   * @returns The CellManager instance.
   */
  public static getInstance(): CellManager {
    if (!CellManager.instance) {
      CellManager.instance = new CellManager();
    }
    return CellManager.instance;
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

  /**
   * Creates and partitions Cells from an image using the provided adapter and cell dimensions.
   * @param imageAdapter - The image adapter to use for retrieving image data.
   * @param cellWidth - The width of each Cell.
   * @param cellHeight - The height of each Cell.
   */
  public async partitionCellsFromImage(imageAdapter: BaseImageAdapter, cellWidth: number, cellHeight: number): Promise<void> {
    const metadata = await imageAdapter.getMetadata();
    const width = (await imageAdapter.getImageData()).width;
    const height = (await imageAdapter.getImageData()).height;

    if (!width || !height) return; // Guard for empty metadata

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
  }

  // Additional methods for managing cells
}

export default CellManager;
