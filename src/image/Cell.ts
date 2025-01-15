import {
  BaseImageAdapter,
  PixelValue,
  ImageData,
} from './adapters/BaseImageAdapter';

export type Rectangle = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
};

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
    let r = 0,
      g = 0,
      b = 0,
      count = 0;
    for (let y = this.y; y < this.y + this.height; y++) {
      for (let x = this.x; x < this.x + this.width; x++) {
        const {
          r: red,
          g: green,
          b: blue,
        } = await this.adapter.getChannelValues(x, y);
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
  async getEntropyWithColor(colorSensitivity: number = 1): Promise<number> {
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
      const quantizedR =
        Math.round(pixel.r / colorSensitivity) * colorSensitivity;
      const quantizedG =
        Math.round(pixel.g / colorSensitivity) * colorSensitivity;
      const quantizedB =
        Math.round(pixel.b / colorSensitivity) * colorSensitivity;
      const key = `${quantizedR},${quantizedG},${quantizedB}`;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    return Array.from(colorCounts.values()).reduce((entropy, count) => {
      const p = count / totalPixels;
      return entropy - p * Math.log2(p);
    }, 0);
  }

  /*
   * Calculates the entropy of the grayscale values within the cell.
   * Entropy is a measure of randomness or diversity of grayscale values.
   * @param colorSensitivity - The sensitivity for color quantization.
   * @returns The entropy value.
   */
  async getEntropyGreyscale(colorSensitivity: number = 1): Promise<number> {
    const pixels = await this.adapter.getChannelValuesForRegion(
      this.x,
      this.x + this.width,
      this.y,
      this.y + this.height
    );
    const grayscaleCounts = new Map<number, number>();
    const totalPixels = pixels.length;

    if (totalPixels === 0) return 0;

    // Convert RGB to grayscale and quantize based on sensitivity
    for (const pixel of pixels) {
      // Convert to grayscale using the standard luminance formula
      const grayscaleValue =
        Math.round(
          (0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b) /
            colorSensitivity
        ) * colorSensitivity;

      // Count occurrences of each quantized grayscale value
      grayscaleCounts.set(
        grayscaleValue,
        (grayscaleCounts.get(grayscaleValue) || 0) + 1
      );
    }

    // Calculate entropy
    let entropy = 0;
    for (const count of grayscaleCounts.values()) {
      const probability = count / totalPixels;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  // Calculate the bounding box of the cell
  getRectangle(): Rectangle {
    const rectangle: Rectangle = {
      xMin: this.x,
      xMax: this.y + this.width,
      yMin: this.y,
      yMax: this.y + this.height,
      width: this.width,
      height: this.height,
    };
    return rectangle;
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
        channels: (await this.adapter.getImageData()).imageMetadata.channels,
      },
      width: this.width,
      height: this.height,
      pixelData,
    };
    return imageDataToReturn;
  }
}
