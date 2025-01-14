import { BaseImageAdapter } from './adapters/BaseImageAdapter';

export class Cell {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    private adapter: BaseImageAdapter
  ){
    
  }
  async hasPixels(): Promise<boolean> {
    for (let y = this.y; y < this.y + this.height; y++) {
      for (let x = this.x; x < this.x + this.width; x++) {
        if (await this.adapter.getChannelValue(x, y, 'r') !== undefined) {
          return true;
        }
      }
    }
    return false;
  }

  async getAverageColor(): Promise<{ r: number; g: number; b: number }> {
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

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

  async getEntropy(): Promise<number> {
    const colorCounts: Record<string, number> = {};
    let totalPixels = 0;

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const { r, g, b } = await this.adapter.getChannelValues(this.x + i, this.y + j);
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

  async getMinColor(channel: 'r' | 'g' | 'b'): Promise<number> {
    let min = 255;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const { r, g, b } = await this.adapter.getChannelValues(this.x + i, this.y + j);
        const value = channel === 'r' ? r : channel === 'g' ? g : b;
        if (value < min) min = value;
      }
    }
    return min;
  }

  async getMaxColor(channel: 'r' | 'g' | 'b'): Promise<number> {
    let max = 0;
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const { r, g, b } = await this.adapter.getChannelValues(this.x + i, this.y + j);
        const value = channel === 'r' ? r : channel === 'g' ? g : b;
        if (value > max) max = value;
      }
    }
    return max;
  }

  async saveToFile(uuid: string): Promise<void> {
    /*
    const filename = `${uuid}-${this.x}-${this.y}.png`;
    try {
      // Extract cell image data
      const cellData = await this.adapter.getChannelValuesForRegion(
        this.x,
        this.x + this.width,
        this.y,
        this.y + this.height
      )
      
      // Create a new adapter instance for the cell.
      const cellAdapter = new BaseImageAdapter();
      
      // Save the cell image to file
      await cellAdapter.toFile(`./output/${filename}`);
      console.log(`Cell saved to ./output/${filename}`);
    } catch (error) {
      console.error(`Failed to save cell: ${error}`);
    }
      */
  }

  // Other methods...
}
