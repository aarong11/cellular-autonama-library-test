import { JimpAdapter } from './image/adapters/JimpAdapter';
import CellManager from './managers/CellManager';
import { Cell } from './image/Cell';
import path from 'path';

async function main() {
  const filePath = path.resolve(__dirname, '../fixtures/input.png');
  const imageAdapter = await new JimpAdapter({ 
    imageMetadata: { format: 'png', size: 0, channels: ['r', 'g', 'b', 'a'] }, 
    width: 0, 
    height: 0, 
    pixelData: [] 
  }).fromFile(filePath);

  const cellManager = new CellManager();

  const cells: Cell[] = await cellManager.partitionCellsFromImage(imageAdapter);
  for(let i = 0; i < cells.length; i++) {
    async function test() {
      const cell = cells[i];
      console.log(`
            Cell ${i}: ${cell.width}x${cell.height}
            Entropy: ${await cell.getEntropy()}
            `);
    }

    test();
  }
}

main().catch(console.error);
