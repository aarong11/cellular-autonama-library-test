import { JimpAdapter } from '@src/image/adapters/JimpAdapter';
import { ImageData, PixelValue } from '@src/image/adapters/BaseImageAdapter';
import fs from 'fs';
import path from 'path';
import Jimp from 'jimp'; // Added import

const fixturesPath = path.join(__dirname, '../fixtures');
const testImagePath = path.join(fixturesPath, 'test_image.png');
const testOutputPath = path.join(fixturesPath, 'test_output.png');

// Add setup to create empty images if they don't exist
beforeAll(async () => {
  if (!fs.existsSync(fixturesPath)) {
    fs.mkdirSync(fixturesPath);
  }

  if (!fs.existsSync(testImagePath)) {
    const image = new Jimp(10, 10, 0xFF0000FF); // Red image
    await image.writeAsync(testImagePath);
  }

  if (!fs.existsSync(testOutputPath)) {
    fs.writeFileSync(testOutputPath, Buffer.alloc(0));
  }
});

describe('JimpAdapter', () => {
  const createTestImageData = async (): Promise<ImageData> => {
    const image = await Jimp.read(testImagePath);
    return {
      imageMetadata: {
        format: image.getMIME(),
        size: image.bitmap.data.length,
        channels: ['r', 'g', 'b', 'a'],
      },
      width: image.bitmap.width,
      height: image.bitmap.height,
      pixelData: Array.from({ length: image.bitmap.width * image.bitmap.height }, (_, i) => ({
        r: image.bitmap.data[i * 4],
        g: image.bitmap.data[i * 4 + 1],
        b: image.bitmap.data[i * 4 + 2],
        a: image.bitmap.data[i * 4 + 3],
      })),
    };
  };

  it('should initialize with image data', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    expect(adapter).toBeInstanceOf(JimpAdapter);
  });

  it('should convert image to buffer', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    const buffer = await adapter.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('should retrieve image metadata', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    const metadata = await adapter.getMetadata();
    expect(metadata.format).toBe('image/png');
    expect(metadata.channels).toEqual(['r', 'g', 'b', 'a']);
  });

  it('should write image to file', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    await adapter.toFile(testOutputPath);
    expect(fs.existsSync(testOutputPath)).toBe(true);
    fs.unlinkSync(testOutputPath); // Clean up
  });

  it('should load image from file', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    const loadedAdapter = await adapter.fromFile(testImagePath);
    expect(loadedAdapter).toBeInstanceOf(JimpAdapter);
  });

  it('should set and get pixel values', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    const pixelValue: PixelValue = { r: 0, g: 0, b: 0, a: 255 };
    await adapter.setChannelValuesForPixel(0, 0, pixelValue);
    const retrievedPixel = await adapter.getChannelValues(0, 0);
    expect(retrievedPixel).toEqual(pixelValue);
  });

  it('should retrieve pixel values for a region', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    const region = await adapter.getChannelValuesForRegion(0, 2, 0, 2);
    expect(region.length).toBe(4);

    for(let i = 0; i < region.length; i++) {
      const pixel = region[i];
      expect(pixel).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    }

  });

  it('should throw error for out-of-bounds pixel access', async () => {
    const testImageData = await createTestImageData();
    let adapter: JimpAdapter = new JimpAdapter(testImageData);
    await expect(adapter.getChannelValues(-1, 0)).rejects.toThrow('Pixel coordinates out of bounds');
    await expect(adapter.getChannelValues(0, -1)).rejects.toThrow('Pixel coordinates out of bounds');
    await expect(adapter.getChannelValues(10, 0)).rejects.toThrow('Pixel coordinates out of bounds');
    await expect(adapter.getChannelValues(0, 10)).rejects.toThrow('Pixel coordinates out of bounds');
  });
});
