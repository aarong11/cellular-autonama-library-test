import { BaseImageAdapter, ImageData, ImageMetadata, PixelValue } from './BaseImageAdapter';
import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D, Image as CanvasImage } from 'canvas';
import fs from 'fs';

/**
 * Implementation of BaseImageAdapter using the node-canvas library for image processing.
 */
export class NodeCanvasAdapter extends BaseImageAdapter {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  /**
   * Initializes the NodeCanvasAdapter with image data.
   * @param imageData - The ImageData object.
   */
  constructor(imageData: ImageData) {
    super(imageData);
    this.canvas = createCanvas(imageData.width, imageData.height);
    this.ctx = this.canvas.getContext('2d');
    this.populateCanvas();
  }

  /**
   * Populates the canvas with pixel data from ImageData.
   */
  private populateCanvas(): void {
    const imageData = this.ctx.createImageData(this.imageData.width, this.imageData.height);
    const channels = this.imageData.imageMetadata.channels;
    for (let i = 0; i < this.imageData.pixelData.length; i++) {
      const pixel = this.imageData.pixelData[i];
      channels.forEach((channel, index) => {
        imageData.data[i * channels.length + index] = pixel[channel] ?? 0;
      });
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Converts the canvas to a Buffer in PNG format.
   * @returns A promise that resolves to a Buffer.
   */
  async toBuffer(): Promise<Buffer> {
    return this.canvas.toBuffer('image/png');
  }

  /**
   * Retrieves the image metadata.
   * @returns A promise that resolves to the ImageMetadata.
   */
  async getMetadata(): Promise<ImageMetadata> {
    return this.imageData.imageMetadata;
  }

  /**
   * Writes the canvas to a file in PNG format.
   * @param outputPath - The path where the file will be saved.
   * @returns A promise that resolves when the file is written.
   */
  async toFile(outputPath: string): Promise<void> {
    const buffer = await this.toBuffer();
    await fs.promises.writeFile(outputPath, buffer);
  }

  /**
   * Loads an image from a file and creates a new NodeCanvasAdapter instance.
   * @param filePath - The path of the file to load.
   * @returns A promise that resolves to a new NodeCanvasAdapter instance.
   */
  async fromFile(filePath: string): Promise<BaseImageAdapter> {
    const canvasImage: CanvasImage = await loadImage(filePath);
    const tempCanvas = createCanvas(canvasImage.width, canvasImage.height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvasImage, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, canvasImage.width, canvasImage.height);
    const channels = ['r', 'g', 'b', 'a'];
    const pixelData: PixelValue[] = [];
    for (let i = 0; i < imageData.data.length; i += channels.length) {
      const pixel: PixelValue = {};
      channels.forEach((channel, index) => {
        pixel[channel] = imageData.data[i + index];
      });
      pixelData.push(pixel);
    }
    const metadata: ImageMetadata = {
      format: 'png',
      size: imageData.data.length,
      channels,
    };
    const newImageData: ImageData = {
      imageMetadata: metadata,
      width: imageData.width,
      height: imageData.height,
      pixelData,
    };
    return new NodeCanvasAdapter(newImageData);
  }

  /**
   * Sets the RGBA values for a specific pixel in the canvas.
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @param pixelValue - The PixelValue object containing RGBA values.
   * @returns A promise that resolves to the updated BaseImageAdapter.
   */
  async setChannelValuesForPixel(x: number, y: number, pixelValue: PixelValue): Promise<BaseImageAdapter> {
    const ctx = this.ctx;
    const channels = this.imageData.imageMetadata.channels;
    const rgba = channels.map(channel => pixelValue[channel] ?? 255).join(', ');
    ctx.fillStyle = `rgba(${rgba})`;
    ctx.fillRect(x, y, 1, 1);
    this.imageData.pixelData[y * this.imageData.width + x] = pixelValue;
    return this;
  }

  /**
   * Retrieves the pixel value at the specified coordinates.
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @returns A promise that resolves to the PixelValue object.
   */
  async getChannelValues(x: number, y: number): Promise<PixelValue> {
    if (
      x < 0 || x >= this.imageData.width ||
      y < 0 || y >= this.imageData.height
    ) {
      throw new Error('Pixel coordinates out of bounds');
    }
    const pixel = this.imageData.pixelData[y * this.imageData.width + x];
    return {
      r: pixel.r,
      g: pixel.g,
      b: pixel.b,
      a: pixel.a ?? 255,
    };
  }

  /**
   * Retrieves pixel values for a specified region.
   * @param xStart - The starting x-coordinate.
   * @param xEnd - The ending x-coordinate.
   * @param yStart - The starting y-coordinate.
   * @param yEnd - The ending y-coordinate.
   * @returns A promise that resolves to an array of PixelValue objects.
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

export default NodeCanvasAdapter;
