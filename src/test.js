const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function stitchImages() {
  const directory = './output';
  const files = fs.readdirSync(directory).filter(file => file.startsWith('cell_') && file.endsWith('.png'));

  // Extract coordinates from filenames
  const coordinates = files.map(file => {
    const match = file.match(/cell_(\d+)_(\d+)\.png/);
    return { file, x: parseInt(match[2]), y: parseInt(match[1]) };
  });

  // Determine the number of rows and columns
  const maxX = Math.max(...coordinates.map(coord => coord.x));
  const maxY = Math.max(...coordinates.map(coord => coord.y));

  // Read the first image to get dimensions
  const firstImage = await Jimp.read(path.join(directory, coordinates[0].file));
  const cellWidth = firstImage.bitmap.width;
  const cellHeight = firstImage.bitmap.height;

  // Create a new image with the total width and height
  const stitchedImage = new Jimp((maxX) * cellWidth, (maxY) * cellHeight);

  for (const { file, x, y } of coordinates) {
    const image = await Jimp.read(path.join(directory, file));
    console.log(`Placing ${file} at (${x * cellWidth}, ${y * cellHeight})`);
    stitchedImage.composite(image, (x - 1) * cellWidth, y * cellHeight);
  }

  // Save the stitched image
  stitchedImage.write('stitched.png', (err) => {
    if (err) throw err;
    console.log('Stitched image saved as stitched.png');
  });
}

stitchImages().catch(err => {
  console.error(err);
});