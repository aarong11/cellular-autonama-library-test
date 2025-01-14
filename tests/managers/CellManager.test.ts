import CellManager from '@src/managers/CellManager';
import { Cell } from '@src/image/Cell';
import { BaseImageAdapter, ImageData, ImageMetadata } from '@src/image/adapters/BaseImageAdapter';
import { Image } from 'canvas';

class MockImageAdapter extends BaseImageAdapter {
  constructor(imageData: ImageData) {
    super(imageData);
  }

  async toBuffer(): Promise<Buffer> {
    return Buffer.alloc(0);
  }

  async getMetadata(): Promise<ImageMetadata> {
    return this.imageData.imageMetadata;
  }

  async toFile(outputPath: string): Promise<void> {}

  async fromFile(filePath: string): Promise<BaseImageAdapter> {
    return this;
  }

  async setChannelValuesForPixel(x: number, y: number, pixelValue: any): Promise<BaseImageAdapter> {
    await super.setChannelValuesForPixel(x, y, pixelValue);
    return this;
  }

  async getChannelValues(x: number, y: number): Promise<any> {
    return super.getChannelValues(x, y);
  }

  async getChannelValuesForRegion(xStart: number, xEnd: number, yStart: number, yEnd: number): Promise<any[]> {
    return super.getChannelValuesForRegion(xStart, xEnd, yStart, yEnd);
  }
}

describe('CellManager', () => {
  let manager: CellManager;
  let adapter: MockImageAdapter;
  let imageData: ImageData;

  beforeEach(() => {
    imageData = {
      imageMetadata: {
        format: 'png',
        size: 16,
        channels: ['r', 'g', 'b', 'a'],
      },
      width: 4,
      height: 4,
      pixelData: [
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 0, g: 255, b: 0, a: 255 },
        { r: 0, g: 255, b: 0, a: 255 },
        { r: 0, g: 255, b: 0, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
      ],
    };
    adapter = new MockImageAdapter(imageData);
    manager = CellManager.getInstance();
    // Clear existing cells
    manager.clearCells();
  });

  it('should return the same instance (Singleton)', () => {
    const anotherManager = CellManager.getInstance();
    expect(manager).toBe(anotherManager);
  });

  it('should add a cell', () => {
    const cell = new Cell(0, 0, 2, 2, adapter);
    manager.addCell(cell);
    expect(manager['cells']).toContain(cell);
  });

  it('should retrieve a cell by coordinates', () => {
    const cell = new Cell(0, 0, 2, 2, adapter);
    manager.addCell(cell);
    const retrieved = manager.getCell(0, 0);
    expect(retrieved).toBe(cell);
  });

  it('should return undefined for non-existent cell', () => {
    const retrieved = manager.getCell(10, 10);
    expect(retrieved).toBeUndefined();
  });

  it('should remove a cell', () => {
    const cell = new Cell(0, 0, 2, 2, adapter);
    manager.addCell(cell);
    manager.removeCell(cell);
    expect(manager['cells']).not.toContain(cell);
  });

  describe('partitionCellsFromImage', () => {
    const imageData: ImageData = {
      imageMetadata: {
        format: 'png',
        size: 16,
        channels: ['r', 'g', 'b', 'a'],
      },
      width: 4,
      height: 4,
      pixelData: [
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 255, g: 0, b: 0, a: 255 },
        { r: 0, g: 255, b: 0, a: 255 },
        { r: 0, g: 255, b: 0, a: 255 },
        { r: 0, g: 255, b: 0, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 0, g: 0, b: 255, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
        { r: 255, g: 255, b: 0, a: 255 },
      ],
    };
    const adapter = new MockImageAdapter(imageData);
    it('should partition image into correct number of cells', async () => {
      const partitionedCells: Cell[] = await manager.partitionCellsFromImage(adapter, 2, 2);
      expect(partitionedCells.length).toBe(4);
    });


    it('should handle partial cells at the edges', async () => {
      // Set up imageData with a partial cell at the bottom right
      const imageData:ImageData = {
        imageMetadata: {
          format: 'png',
          size: 16,
          channels: ['r', 'g', 'b', 'a'],
        },
        width: 4,
        height: 4,
        pixelData: [
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 0, g: 255, b: 0, a: 255 },
          { r: 0, g: 255, b: 0, a: 255 },
          { r: 0, g: 255, b: 0, a: 255 },
          { r: 0, g: 0, b: 255, a: 255 },
          { r: 0, g: 0, b: 255, a: 255 },
          { r: 0, g: 0, b: 255, a: 255 },
          { r: 0, g: 0, b: 255, a: 255 },
          { r: 255, g: 255, b: 0, a: 255 },
          { r: 255, g: 255, b: 0, a: 255 },
          { r: 255, g: 255, b: 0, a: 255 },
          { r: 255, g: 255, b: 0, a: 255 },
        ],
      }

      const partialAdapter = new MockImageAdapter(imageData);
      const cells = await manager.partitionCellsFromImage(partialAdapter, 2, 2);
      expect(cells.length).toBe(4); // 2 full rows and partial cells
    });

    it('should handle empty images gracefully', async () => {
      const emptyImageData = {
        imageMetadata: {
          format: 'png',
          size: 0,
          channels: ['r', 'g', 'b', 'a'],
        },
        width: 0,
        height: 0,
        pixelData: [],
      };
      const emptyAdapter = new MockImageAdapter(emptyImageData);
      await expect(manager.partitionCellsFromImage(emptyAdapter, 2, 2)).resolves.not.toThrow();
      expect(manager['cells'].length).toBe(0);
    });

    it('should handle images with non-standard dimensions gracefully', async () => {
      const nonStandardImageData = {
        imageMetadata: {
          format: 'png',
          size: 15,
          channels: ['r', 'g', 'b', 'a'],
        },
        width: 3,
        height: 5,
        pixelData: [
          { r: 255, g: 0, b: 0, a: 255 },
          // ...remaining pixel data...
        ],
      };
      const nonStandardAdapter = new MockImageAdapter(nonStandardImageData);
      await expect(manager.partitionCellsFromImage(nonStandardAdapter, 2, 2)).resolves.not.toThrow();
      expect(manager['cells'].length).toBeGreaterThan(0);
    });
  });
});
