
import Jimp from 'jimp';
import { JimpAdapter } from '@src/image/adapters/JimpAdapter';
import { createTestImage, cleanUpTestImages, testImagePath, outputImagePath } from '../testUtils';
import fs from 'fs';

describe('JimpAdapter', () => {
  var adapter: JimpAdapter;
  beforeAll(async () => {
    const image = await Jimp.create(1000, 1000, 0xFF0000FF); // Create a 1000x1000 red image

    // Save the image to a file
    const file = 'fixtures/test.jpg';
    await image.writeAsync(file);

    adapter = new JimpAdapter(image);
    await createTestImage(adapter);
  });

  afterAll(() => {
    cleanUpTestImages();
  });

  it('should convert image to buffer', async () => {
    const adapter = await JimpAdapter.create(testImagePath);
    const buffer = await adapter.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('should retrieve image metadata', async () => {
    const adapter = await JimpAdapter.create(testImagePath);
    const metadata = await adapter.getMetadata();
    expect(metadata).toHaveProperty('width');
    expect(metadata).toHaveProperty('height');
  });

  it('should save the image to a file', async () => {
    const adapter = await JimpAdapter.create(testImagePath);
    await adapter.toFile(outputImagePath);
    expect(fs.existsSync(outputImagePath)).toBe(true);
  });

  it('should get the correct channel value', async () => {
    const redValue = await adapter.getChannelValue(0, 0, 'r');
    const greenValue = await adapter.getChannelValue(0, 0, 'g');
    const blueValue = await adapter.getChannelValue(0, 0, 'b');

    expect(redValue).toBe(255);
    expect(greenValue).toBe(0);
    expect(blueValue).toBe(0);
  });

  it('should get the correct channel values', async () => {
    const { r, g, b } = await adapter.getChannelValues(0, 0);

    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });
});