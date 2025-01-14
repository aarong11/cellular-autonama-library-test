import Jimp from 'jimp';
import { JimpAdapter } from '../src/image/adapters/JimpAdapter';
import { partitionImageIntoCells } from '../src/image/partition';
import { Cell } from '../src/image/Cell';

describe('Cell partitioning', () => {
  it('should create the correct number of cells', async () => {
    const image = await Jimp.create(20, 20, 0xFFFFFFFF); // Create a 20x20 white image
    const adapter = new JimpAdapter(image);
    const cells:Cell[] = await partitionImageIntoCells(adapter, 10, 10);

    expect(cells.length).toBe(4); // 20x20 image with 10x10 cells should result in 4 cells
  });

  it('should handle non-divisible dimensions correctly', async () => {
    const image = await Jimp.create(25, 25, 0xFFFFFFFF); // Create a 25x25 white image
    const adapter = new JimpAdapter(image);
    const cells:Cell[] = await partitionImageIntoCells(adapter, 10, 10);

    expect(cells.length).toBe(9); // 25x25 image with 10x10 cells should result in 9 cells
  });
});
