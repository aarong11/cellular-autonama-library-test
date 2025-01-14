import { BaseImageAdapter } from '@src/image/adapters/BaseImageAdapter';
import { Cell } from './Cell';

// Function to partition an image into cells
export async function partitionImageIntoCells(
  imageAdapter: BaseImageAdapter,
  cellWidth: number,
  cellHeight: number
): Promise<Cell[]> {
  // Retrieve image dimensions
  const { width, height } = await imageAdapter.getMetadata();
  if (!width || !height) return []; // Guard for empty metadata

  const cells: Cell[] = [];
  
  // Loop through the image and create cells
  for (let y = 0; y < height; y += cellHeight) {
    for (let x = 0; x < width; x += cellWidth) {
      const cell:Cell = new Cell(
        x,
        y,
        Math.min(cellWidth, width - x),
        Math.min(cellHeight, height - y),
        imageAdapter
      );
      if (await cell.hasPixels()) {
        cells.push(cell);
      }
    }
  }
  return cells;
}