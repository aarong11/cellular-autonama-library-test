export abstract class BaseImageAdapter {
  protected imageData: { width: number; height: number; data: Uint8Array };

  constructor() {
    this.imageData = { width: 0, height: 0, data: new Uint8Array() };
  }

  abstract toBuffer(): Promise<Buffer>;
  abstract getMetadata(): Promise<{ width: number; height: number }>;
  abstract toFile(outputPath: string): Promise<void>;
  abstract fromFile(filePath: string): Promise<BaseImageAdapter>;

  async getChannelValue(x: number, y: number, channel: 'r' | 'g' | 'b'): Promise<number> {
    const index = (y * this.imageData.width + x) * 4;
    switch (channel) {
      case 'r':
        return this.imageData.data[index];
      case 'g':
        return this.imageData.data[index + 1];
      case 'b':
        return this.imageData.data[index + 2];
      default:
        throw new Error('Invalid channel');
    }
  }

  async getChannelValues(x: number, y: number): Promise<{ r: number; g: number; b: number }> {
    const index = (y * this.imageData.width + x) * 4;
    return {
      r: this.imageData.data[index],
      g: this.imageData.data[index + 1],
      b: this.imageData.data[index + 2],
    };
  }

  // Rerurns a collection of channel values for a defined region of the image
  async getChannelValuesForRegion(
    xStart: number,
    xEnd: number,
    yStart: number,
    yEnd: number
  ): Promise<{ r: Uint8Array; g: Uint8Array; b: Uint8Array }> {
    const r = new Uint8Array((xEnd - xStart) * (yEnd - yStart));
    const g = new Uint8Array((xEnd - xStart) * (yEnd - yStart));
    const b = new Uint8Array((xEnd - xStart) * (yEnd - yStart));

    let index = 0;
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const { r: red, g: green, b: blue } = await this.getChannelValues(x, y);
        r[index] = red;
        g[index] = green;
        b[index] = blue;
        index++;
      }
    }

    return { r, g, b };
  }

  setImageData(width: number, height: number, data: Uint8Array): void {
    this.imageData = { width, height, data };
  }

  getImageData(): { width: number; height: number; data: Uint8Array } {
    return this.imageData;
  }
}