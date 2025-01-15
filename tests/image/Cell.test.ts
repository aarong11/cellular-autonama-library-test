import { Cell } from '@src/image/Cell';
import {
  BaseImageAdapter,
  PixelValue,
  ImageData,
  ImageMetadata,
} from '@src/image/adapters/BaseImageAdapter';

class MockImageAdapter extends BaseImageAdapter {
  constructor(imageData: ImageData) {
    super(imageData);
  }

  async toBuffer(): Promise<Buffer> {
    return Buffer.alloc(0);
  }

  async fromImageData(imageData: ImageData): Promise<BaseImageAdapter> {
    return this;
  }

  async getMetadata(): Promise<ImageMetadata> {
    return this.imageData.imageMetadata;
  }

  async toFile(outputPath: string): Promise<void> {}

  async fromFile(filePath: string): Promise<BaseImageAdapter> {
    return this;
  }

  async setChannelValuesForPixel(
    x: number,
    y: number,
    pixelValue: PixelValue
  ): Promise<BaseImageAdapter> {
    await super.setChannelValuesForPixel(x, y, pixelValue);
    return this;
  }

  async getChannelValues(x: number, y: number): Promise<PixelValue> {
    return super.getChannelValues(x, y);
  }

  async getChannelValuesForRegion(
    xStart: number,
    xEnd: number,
    yStart: number,
    yEnd: number
  ): Promise<PixelValue[]> {
    return super.getChannelValuesForRegion(xStart, xEnd, yStart, yEnd);
  }
}

describe('Cell', () => {
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

  it('should initialize correctly', () => {
    const cell = new Cell(0, 0, 2, 2, new MockImageAdapter(imageData));
    expect(cell.x).toBe(0);
    expect(cell.y).toBe(0);
    expect(cell.width).toBe(2);
    expect(cell.height).toBe(2);
  });

  describe('hasPixels', () => {
    it('should return true if cell has pixels', async () => {
      const cell = new Cell(0, 0, 2, 2, new MockImageAdapter(imageData));
      await expect(cell.hasPixels()).resolves.toBe(true);
    });

    it('should return false if cell has no pixels', async () => {
      const emptyImageData = {
        ...imageData,
        pixelData: imageData.pixelData.map(() => ({ r: 0, g: 0, b: 0, a: 0 })),
      };
      const emptyAdapter = new MockImageAdapter(emptyImageData);
      const cell = new Cell(0, 0, 0, 0, emptyAdapter);
      await expect(cell.hasPixels()).resolves.toBe(false);
    });
  });

  describe('getAverageColor', () => {
    it('should calculate correct average color for uniform pixels', async () => {
      const cell = new Cell(0, 0, 1, 1, new MockImageAdapter(imageData));
      const avgColor = await cell.getAverageColor();
      expect(avgColor).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should calculate correct average color for mixed pixels', async () => {
      const mixedImageData = {
        ...imageData,
        pixelData: [
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
        ],
      };
      const mixedAdapter = new MockImageAdapter(mixedImageData);
      const cell = new Cell(0, 0, 1, 1, mixedAdapter);
      const avgColor = await cell.getAverageColor();
      expect(avgColor).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('getEntropy', () => {
    it('should return 0 entropy for uniform color', async () => {
      const imageData = {
        imageMetadata: {
          format: 'png',
          size: 16,
          channels: ['r', 'g', 'b', 'a'],
        },
        width: 2,
        height: 2,
        pixelData: [
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
        ],
      };
      const cell = new Cell(0, 0, 2, 2, new MockImageAdapter(imageData));
      const entropy = await cell.getEntropyWithColor();
      expect(entropy).toBe(0);
    });

    it('should calculate correct entropy for diverse colors', async () => {
      const imageData = {
        imageMetadata: {
          format: 'png',
          size: 16,
          channels: ['r', 'g', 'b', 'a'],
        },
        width: 2,
        height: 2,
        pixelData: [
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 0, g: 255, b: 0, a: 255 },
          { r: 255, g: 0, b: 255, a: 255 },
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 0, g: 255, b: 0, a: 255 },
          { r: 255, g: 0, b: 255, a: 255 },
        ],
      };

      const diverseImageData = {
        ...imageData,
        pixelData: [
          { r: 255, g: 0, b: 0, a: 255 },
          { r: 0, g: 255, b: 0, a: 255 },
          { r: 0, g: 0, b: 255, a: 255 },
          { r: 255, g: 255, b: 0, a: 255 },
        ],
      };
      const diverseAdapter = new MockImageAdapter(diverseImageData);
      const cell = new Cell(0, 0, 2, 2, diverseAdapter);
      const entropy = await cell.getEntropyWithColor();
      expect(entropy).toBeCloseTo(2, 1);
    });

    it('should return 0 entropy for empty cell', async () => {
      const emptyImageData = {
        ...imageData,
        pixelData: imageData.pixelData.map(() => ({ r: 0, g: 0, b: 0, a: 0 })),
      };
      const emptyAdapter = new MockImageAdapter(emptyImageData);
      const cell = new Cell(0, 0, 2, 2, emptyAdapter);
      const entropy = await cell.getEntropyWithColor();
      expect(entropy).toBe(0);
    });
  });

  describe('getRGBValuesForCoordinates', () => {
    it('should return correct RGB values for valid coordinates', async () => {
      const cell = new Cell(0, 0, 2, 2, new MockImageAdapter(imageData));
      const rgb = await cell.getRGBValuesForCoordinates(0, 0);
      expect(rgb).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    });

    it('should throw error for invalid coordinates', async () => {
      const cell = new Cell(0, 0, 2, 2, new MockImageAdapter(imageData));
      await expect(cell.getRGBValuesForCoordinates(-1, 0)).rejects.toThrow(
        'Pixel coordinates out of bounds'
      );
      await expect(cell.getRGBValuesForCoordinates(0, -1)).rejects.toThrow(
        'Pixel coordinates out of bounds'
      );
      await expect(cell.getRGBValuesForCoordinates(4, 0)).rejects.toThrow(
        'Pixel coordinates out of bounds'
      );
      await expect(cell.getRGBValuesForCoordinates(0, 4)).rejects.toThrow(
        'Pixel coordinates out of bounds'
      );
    });
  });

  it('should handle cells with transparent pixels', () => {
    const transparentImageData = {
      imageMetadata: {
        format: 'png',
        size: 16,
        channels: ['r', 'g', 'b', 'a'],
      },
      width: 4,
      height: 4,
      pixelData: [{ r: 255, g: 0, b: 0, a: 0 }],
    };
    const adapter = new MockImageAdapter(transparentImageData);
    const cell = new Cell(0, 0, 2, 2, adapter);

    cell.hasPixels().then((result) => {
      expect(result).toBe(true);
    });
  });
});
