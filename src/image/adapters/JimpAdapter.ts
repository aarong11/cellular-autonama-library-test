import Jimp from 'jimp';
import { BaseImageAdapter } from './BaseImageAdapter';

export class JimpAdapter extends BaseImageAdapter {
  private image: Jimp;

  constructor(image: Jimp) {
    super();
    this.image = image;
    this.setImageData(image.bitmap.width, image.bitmap.height, new Uint8Array(image.bitmap.data));
  }

  async fromFile(imagePath: string): Promise<JimpAdapter> {
    const image = await Jimp.read(imagePath);
    const jimpAdapter = new JimpAdapter(image);
    return jimpAdapter;
  }

  static async create(imagePath: string): Promise<JimpAdapter> {
    const image = await Jimp.read(imagePath);
    return new JimpAdapter(image);
  }

  async toBuffer(): Promise<Buffer> {
    return await this.image.getBufferAsync(Jimp.MIME_JPEG);
  }

  async getMetadata(): Promise<{ width: number; height: number }> {
    const { bitmap } = this.image;
    return { width: bitmap.width, height: bitmap.height };
  }

  async toFile(outputPath: string): Promise<void> {
    await this.image.writeAsync(outputPath);
  }

  async getChannelValue(x: number, y: number, channel: 'r' | 'g' | 'b'): Promise<number> {
    const pixel = this.image.getPixelColor(x, y);
    const channels = Jimp.intToRGBA(pixel);
    return channels[channel];
  }

  async getChannelValues(x: number, y: number): Promise<{ r: number; g: number; b: number }> {
    const pixel = this.image.getPixelColor(x, y);
    return Jimp.intToRGBA(pixel);
  }
}

export default JimpAdapter;
