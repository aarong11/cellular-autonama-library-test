import { BaseImageAdapter, PixelValue, ImageData } from './adapters/BaseImageAdapter';

/**
 * Represents a rectangular region (cell) within an image.
 * Provides methods to analyze pixel data within the cell.
 */
export class Cell {
  /**
   * Creates an instance of Cell.
   * @param x - The x-coordinate of the cell's top-left corner.
   * @param y - The y-coordinate of the cell's top-left corner.
   * @param width - The width of the cell.
   * @param height - The height of the cell.
   * @param adapter - The image adapter to interact with pixel data.
   */
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    private adapter: BaseImageAdapter
  ) {}

  /**
   * Checks if the cell contains any non-transparent pixels.
   * @returns True if at least one pixel has an undefined red channel; otherwise, false.
   */
  async hasPixels(): Promise<boolean> {
    for (let y = this.y; y < this.y + this.height; y++) {
      for (let x = this.x; x < this.x + this.width; x++) {
        if ((await this.adapter.getChannelValues(x, y)).r !== undefined) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Calculates the average color of all pixels within the cell.
   * @returns An object containing the average red, green, and blue values.
   */
  async getAverageColor(): Promise<{ r: number; g: number; b: number }> {
    let r = 0, g = 0, b = 0, count = 0;
    for (let y = this.y; y < this.y + this.height; y++) {
      for (let x = this.x; x < this.x + this.width; x++) {
        const { r: red, g: green, b: blue } = await this.adapter.getChannelValues(x, y);
        r += red;
        g += green;
        b += blue;
        count++;
      }
    }
    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count),
    };
  }

  /**
   * Calculates the entropy of the colors within the cell.
   * Entropy is a measure of randomness or diversity of colors.
   * @param colorSensitivity - The sensitivity for color quantization.
   * @returns The entropy value.
   */
  async getEntropy(colorSensitivity: number = 1): Promise<number> {
    const pixels = await this.adapter.getChannelValuesForRegion(
      this.x, 
      this.x + this.width,
      this.y, 
      this.y + this.height
    );
    
    const colorCounts = new Map<string, number>();
    const totalPixels = pixels.length;

    if (totalPixels === 0) return 0;

    // Quantize colors based on sensitivity
    for (const pixel of pixels) {
      const quantizedR = Math.round(pixel.r / colorSensitivity) * colorSensitivity;
      const quantizedG = Math.round(pixel.g / colorSensitivity) * colorSensitivity;
      const quantizedB = Math.round(pixel.b / colorSensitivity) * colorSensitivity;
      const key = `${quantizedR},${quantizedG},${quantizedB}`;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    return Array.from(colorCounts.values()).reduce((entropy, count) => {
      const p = count / totalPixels;
      return entropy - p * Math.log2(p);
    }, 0);
  }

  /**
   * Retrieves the RGB values for a specific coordinate within the cell.
   * @param x - The x-coordinate relative to the image.
   * @param y - The y-coordinate relative to the image.
   * @returns An object containing the red, green, and blue values.
   */
  async getRGBValuesForCoordinates(x: number, y: number): Promise<PixelValue> {
    return await this.adapter.getChannelValues(x, y);
  }

  /**
   * Retrieves the image data for the cell.
   * @returns The ImageData object for the cell.
   */
  public async getImageData(): Promise<ImageData> {
    const pixelData: PixelValue[] = [];
    for (let y = this.y; y < this.y + this.height; y++) {
      for (let x = this.x; x < this.x + this.width; x++) {
        const pixel = await this.adapter.getChannelValues(x, y);
        pixelData.push(pixel);
      }
    }
    const imageDataToReturn: ImageData = {
      imageMetadata: {
        format: 'png',
        size: 0,
        channels: (await this.adapter.getImageData()).imageMetadata.channels
      },
      width: this.width,
      height: this.height,
      pixelData,
    };
    return imageDataToReturn;
  }
}
