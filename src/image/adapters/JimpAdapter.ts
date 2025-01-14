import Jimp from 'jimp';
import { BaseImageAdapter, ImageData, ImageMetadata, PixelValue } from './BaseImageAdapter';

/**
 * Implementation of BaseImageAdapter using the Jimp library for image processing.
 */
export class JimpAdapter extends BaseImageAdapter {
  private image: Jimp;

  /**
   * Initializes the JimpAdapter with ImageData.
   * @param imageData - The ImageData object.
   */
  constructor(imageData: ImageData) {
    super(imageData);
    this.image = new Jimp(imageData.width, imageData.height);
    const channels = imageData.imageMetadata.channels;
    for (let i = 0; i < imageData.pixelData.length; i++) {
      const pixel = imageData.pixelData[i];
      const idx = i * channels.length;
      channels.forEach((channel, index) => {
        this.image.bitmap.data[idx + index] = pixel[channel] ?? 0;
      });
    }
  }

  /**
   * Converts the Jimp image to a Buffer in PNG format.
   * @returns A promise that resolves to a Buffer.
   */
  async toBuffer(): Promise<Buffer> {
    return await this.image.getBufferAsync(Jimp.MIME_PNG);
  }

  /**
   * Retrieves the image metadata.
   * @returns A promise that resolves to the ImageMetadata.
   */
  async getMetadata(): Promise<ImageMetadata> {
    return this.imageData.imageMetadata;
  }

  /**
   * Writes the Jimp image to a file.
   * @param outputPath - The path where the file will be saved.
   * @returns A promise that resolves when the file is written.
   */
  async toFile(outputPath: string): Promise<void> {
    await this.image.writeAsync(outputPath);
  }

  /**
   * Loads an image from a file and creates a new JimpAdapter instance.
   * @param filePath - The path of the file to load.
   * @returns A promise that resolves to a new JimpAdapter instance.
   */
  async fromFile(filePath: string): Promise<BaseImageAdapter> {
    const image = await Jimp.read(filePath);
    const channels = ['r', 'g', 'b', 'a'];
    const pixelData: PixelValue[] = Array.from({ length: image.bitmap.width * image.bitmap.height }, (_, i) => {
      const idx = i * channels.length;
      const pixel: PixelValue = {};
      channels.forEach((channel, index) => {
        pixel[channel] = image.bitmap.data[idx + index];
      });
      return pixel;
    });
    const imageData: ImageData = {
      imageMetadata: {
        format: image.getMIME(),
        size: image.bitmap.data.length,
        channels,
      },
      width: image.bitmap.width,
      height: image.bitmap.height,
      pixelData,
    };
    return new JimpAdapter(imageData);
  }

  /**
   * Sets the RGBA values for a specific pixel in the Jimp image.
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @param pixelValue - The PixelValue object containing RGBA values.
   * @returns A promise that resolves to the updated BaseImageAdapter.
   */
  async setChannelValuesForPixel(x: number, y: number, pixelValue: PixelValue): Promise<BaseImageAdapter> {
    const idx = this.image.getPixelIndex(x, y);
    const channels = this.imageData.imageMetadata.channels;
    channels.forEach((channel, index) => {
      this.image.bitmap.data[idx + index] = pixelValue[channel] ?? 0;
    });
    return this;
  }

  /**
   * Retrieves the pixel value at the specified coordinates.
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @returns A promise that resolves to the PixelValue object.
   */
  async getChannelValues(x: number, y: number): Promise<PixelValue> {
    if (x < 0 || x >= this.image.bitmap.width || y < 0 || y >= this.image.bitmap.height) {
      throw new Error('Pixel coordinates out of bounds');
    }
    const idx = this.image.getPixelIndex(x, y);
    const channels = this.imageData.imageMetadata.channels;
    const pixel: PixelValue = {};
    channels.forEach((channel, index) => {
      pixel[channel] = this.image.bitmap.data[idx + index] ?? 255;
    });
    return pixel;
  }

  /**
   * Retrieves pixel values for a specified region.
   * @param xStart - The starting x-coordinate.
   * @param xEnd - The ending x-coordinate.
   * @param yStart - The starting y-coordinate.
   * @param yEnd - The ending y-coordinate.
   * @returns An array of PixelValue objects.
   */
  async getChannelValuesForRegion(xStart: number, xEnd: number, yStart: number, yEnd: number): Promise<PixelValue[]> {
    const pixelValues: PixelValue[] = [];
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        pixelValues.push(await this.getChannelValues(x, y));
      }
    }
    return pixelValues;
  }
}

export default JimpAdapter;
