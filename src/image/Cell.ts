import { BaseImageAdapter, PixelValue } from './adapters/BaseImageAdapter';

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
   * @returns The entropy value.
   */
  async getEntropy(): Promise<number> {
    const colorCounts: Record<string, number> = {};
    let totalPixels = 0;

    for (let y = this.y; y < this.y + this.height; y++) {
      for (let x = this.x; x < this.x + this.width; x++) {
        const { r, g, b } = await this.adapter.getChannelValues(x, y);
        const key = `${r},${g},${b}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
        totalPixels++;
      }
    }

    if (totalPixels === 0) return 0;

    return Object.values(colorCounts).reduce((sum, count) => {
      const p = count / totalPixels;
      return sum - p * Math.log2(p);
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
}
