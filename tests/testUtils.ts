import fs from 'fs';
import path from 'path';
import Jimp from 'jimp';

import { JimpAdapter } from '@src/image/adapters/JimpAdapter';
import { BaseImageAdapter } from '@src/image/adapters/BaseImageAdapter';

export const testImagePath = path.resolve(__dirname, '../fixtures/test.jpg');
export const outputImagePath = path.resolve(__dirname, '../fixtures/output.jpg');

export async function createTestImage(imageAdapter: BaseImageAdapter): Promise<void> {
  const width = 100;
  const height = 100;
  const image = await imageAdapter.fromFile(testImagePath);
  await image.toFile(testImagePath);
}

export function cleanUpTestImages(): void {
  if (fs.existsSync(outputImagePath)) {
    fs.unlinkSync(outputImagePath);
  }
}

export async function initializeAdapter(color: number, width: number = 1000, height: number = 1000): Promise<JimpAdapter> {
  const image = await Jimp.create(width, height, color);
  const adapter = new JimpAdapter(image);
  return adapter;
}
