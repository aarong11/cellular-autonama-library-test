export type ImageMetadata = {
  format: string;
  size: number;
  channels: string[]; // Array of channel names (e.g., ['r', 'g', 'b'], ['grayscale'])
};

export type ImageData = {
  imageMetadata: ImageMetadata;
  width: number;
  height: number;
  pixelData: PixelValue[];
};

export type PixelValue = {
  [key: string]: number; // Dynamic channel values
};

export interface IImageAdapter {
  getImageData(): Promise<ImageData>;
  setImageData(imageData: ImageData): Promise<void>;
  toBuffer(): Promise<Buffer>;
  getMetadata(): Promise<ImageMetadata>;
  toFile(outputPath: string): Promise<void>;
  fromFile(filePath: string): Promise<IImageAdapter>;

  // Sets the RGBA values for a pixel at the given coordinates (x, y, pixelValue) and returns the updated image adapter
  setChannelValuesForPixel(x: number, y: number, pixelValue: PixelValue): Promise<BaseImageAdapter>;

  // Returns the RGBA values for a pixel at the given coordinates (x, y)
  getChannelValues(x: number, y: number): Promise<PixelValue>;

  // Returns ImageData for a specific region defined by the given coordinates (xStart, xEnd, yStart, yEnd)
  getChannelValuesForRegion(
      xStart: number,
      xEnd: number,
      yStart: number,
      yEnd: number
  ): Promise<PixelValue[]>;

  createPixelValueArray(width: number, height: number): PixelValue[];
}

export abstract class BaseImageAdapter implements IImageAdapter {
  protected imageData: Readonly<ImageData>;

  constructor(imageData: ImageData) {
    this.imageData = Object.freeze(imageData);
  }

  abstract toBuffer(): Promise<Buffer>;
  abstract getMetadata(): Promise<ImageMetadata>;
  abstract toFile(outputPath: string): Promise<void>;
  abstract fromFile(filePath: string): Promise<IImageAdapter>;

  createPixelValueArray(width: number, height: number): PixelValue[] {
      return new Array<PixelValue>(width * height).fill(
        Object.fromEntries(this.imageData.imageMetadata.channels.map(channel => [channel, 0]))
      );
  }

  async getImageData(): Promise<ImageData> {
      return this.imageData;
  }

  async setImageData(imageData: ImageData): Promise<void> {
      this.imageData = Object.freeze(imageData);
  }

  /**
   * Sets the RGBA values for a pixel at the given coordinates (x, y, pixelValue) and returns the updated image adapter
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @param pixelValue - The PixelValue object containing RGBA values.
   * @returns The updated image adapter.
   */
  async setChannelValuesForPixel(x: number, y: number, pixelValue: PixelValue): Promise<BaseImageAdapter> {
      const index = y * this.imageData.width + x;
      this.imageData.pixelData[index] = { ...this.imageData.pixelData[index], ...pixelValue };
      return this;
  }

  /**
   * Retrieves the pixel value at the specified (x, y) coordinates.
   * @param x - The x-coordinate of the pixel.
   * @param y - The y-coordinate of the pixel.
   * @returns The PixelValue object containing RGBA values.
   * @throws Error if coordinates are out of bounds.
   */
  async getChannelValues(x: number, y: number): Promise<PixelValue> {
    if (
      x < 0 || x >= this.imageData.width ||
      y < 0 || y >= this.imageData.height
    ) {
      throw new Error('Pixel coordinates out of bounds');
    }
    const index = y * this.imageData.width + x;
    const pixel = this.imageData.pixelData[index];
    const pixelValue: PixelValue = { ...pixel };
    
    // Set default values if necessary
    this.imageData.imageMetadata.channels.forEach(channel => {
      if (!(channel in pixelValue)) {
        pixelValue[channel] = 255;
      }
    });
    return pixelValue;
  }

  /**
   * Retrieves the pixel values for a specified region.
   * @param xStart - The starting x-coordinate of the region.
   * @param xEnd - The ending x-coordinate of the region.
   * @param yStart - The starting y-coordinate of the region.
   * @param yEnd - The ending y-coordinate of the region.
   * @returns A promise that resolves to an array of PixelValue objects.
   */
  async getChannelValuesForRegion(
      xStart: number,
      xEnd: number,
      yStart: number,
      yEnd: number
  ): Promise<PixelValue[]> {
    const pixelValues: PixelValue[] = [];
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const value = await this.getChannelValues(x, y);
        pixelValues.push(value);
      }
    }
    return pixelValues;
  }
}