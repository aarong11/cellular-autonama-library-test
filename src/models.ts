export type Cell = {
  x: number;
  y: number;
  width: number;
  height: number;
  getAverageColor(): Promise<{ r: number; g: number; b: number }>;
  getEntropy(): Promise<number>;
  getMinColor(channel: 'r' | 'g' | 'b'): Promise<number>;
  getMaxColor(channel: 'r' | 'g' | 'b'): Promise<number>;
};

