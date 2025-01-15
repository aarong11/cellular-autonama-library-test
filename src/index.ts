import { JimpAdapter } from './image/adapters/JimpAdapter';
import CellManager from './managers/CellManager';
import { Cell } from './image/Cell';
import path from 'path';

async function main() {
  const filePath = path.resolve(__dirname, '../fixtures/input.png');

  console.log(filePath);
  const imageAdapter = await new JimpAdapter({ 
    imageMetadata: { format: 'png', size: 0, channels: ['r', 'g', 'b', 'a'] }, 
    width: 0, 
    height: 0, 
    pixelData: [] 
  }).fromFile(filePath);

  const cellManager = CellManager.getInstance();

  const cells: Cell[] = await cellManager.partitionCellsFromImage(imageAdapter);

  const outputDir = path.resolve(__dirname, '../output');
  await cellManager.saveCellsToImages(imageAdapter, outputDir);
}

main().catch(console.error);
