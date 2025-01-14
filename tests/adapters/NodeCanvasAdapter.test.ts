import { NodeCanvasAdapter } from '@src/image/adapters/NodeCanvasAdapter';
import { ImageData, PixelValue } from '@src/image/adapters/BaseImageAdapter';
import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas'; // Added import

const fixturesPath = path.join(__dirname, '../fixtures');
const testImagePath = path.join(fixturesPath, 'test_image.png');
const testOutputPath = path.join(fixturesPath, 'test_output.png');

// Add setup to create empty images if they don't exist
beforeAll(() => {
  if (!fs.existsSync(fixturesPath)) {
    fs.mkdirSync(fixturesPath);
  }

  if (!fs.existsSync(testImagePath)) {
    const canvas = createCanvas(10, 10);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, 10);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(testImagePath, buffer);
  }

  if (!fs.existsSync(testOutputPath)) {
    fs.writeFileSync(testOutputPath, Buffer.alloc(0));
  }
});

describe('NodeCanvasAdapter', () => {
  const createTestImageData = (): ImageData => ({
    imageMetadata: {
      format: 'png',
      size: 100,
      channels: ['r', 'g', 'b', 'a'],
    },
    width: 10,
    height: 10,
    pixelData: Array.from({ length: 100 }, () => ({ r: 255, g: 0, b: 0, a: 255 })),
  });

  it('should initialize with image data', () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    expect(adapter).toBeInstanceOf(NodeCanvasAdapter);
  });

  it('should convert canvas to buffer', async () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    const buffer = await adapter.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('should retrieve image metadata', async () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    const metadata = await adapter.getMetadata();
    expect(metadata).toEqual(testImageData.imageMetadata);
  });

  it('should write canvas to file', async () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    await adapter.toFile(testOutputPath);
    expect(fs.existsSync(testOutputPath)).toBe(true);
    fs.unlinkSync(testOutputPath); // Clean up
  });

  it('should load image from file', async () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    const loadedAdapter = await NodeCanvasAdapter.prototype.fromFile(testImagePath);
    expect(loadedAdapter).toBeInstanceOf(NodeCanvasAdapter);
  });

  it('should set and get pixel values', async () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    const pixelValue: PixelValue = { r: 0, g: 0, b: 0, a: 255 };
    await adapter.setChannelValuesForPixel(0, 0, pixelValue);
    const retrievedPixel = await adapter.getChannelValues(0, 0);
    expect(retrievedPixel).toEqual(pixelValue);
  });

  it('should retrieve pixel values for a region', async () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    const region = await adapter.getChannelValuesForRegion(0, 2, 0, 2);
    expect(region.length).toBe(4);

    for(let i = 0; i < region.length; i++) {
      const pixel = region[i];
      expect(pixel).toEqual({ r: 255, g: 0, b: 0, a: 255 });
    }

  });

  it('should throw error for out-of-bounds pixel access', async () => {
    const testImageData = createTestImageData();
    let adapter: NodeCanvasAdapter = new NodeCanvasAdapter(testImageData);
    await expect(adapter.getChannelValues(-1, 0)).rejects.toThrow('Pixel coordinates out of bounds');
    await expect(adapter.getChannelValues(0, -1)).rejects.toThrow('Pixel coordinates out of bounds');
    await expect(adapter.getChannelValues(10, 0)).rejects.toThrow('Pixel coordinates out of bounds');
    await expect(adapter.getChannelValues(0, 10)).rejects.toThrow('Pixel coordinates out of bounds');
  });

});
