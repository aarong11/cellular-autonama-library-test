# Components Detailed

This document provides an in-depth explanation of the key components within the Cellular Automata project.

## 1. Adapters Layer

### `BaseImageAdapter.ts`
- **Description:** 
  - An abstract class that defines the contract for image adapters.
  - Manages image data and provides methods to interact with pixel data.
- **Key Methods:**
  - `getImageData()`: Retrieves image data.
  - `setImageData()`: Sets new image data.
  - `toBuffer()`: Converts image to a buffer.
  - `getMetadata()`: Retrieves image metadata.
  - `toFile()`: Writes image to a file.
  - `fromFile()`: Loads image data from a file.
  - `setChannelValuesForPixel()`: Sets RGBA values for a specific pixel.
  - `getChannelValues()`: Retrieves RGBA values for a specific pixel.

### `JimpAdapter.ts`
- **Description:** 
  - Concrete implementation of `BaseImageAdapter` using the Jimp library.
  - Handles actual image processing tasks.
- **Key Methods:** Inherits all abstract methods from `BaseImageAdapter` and implements them using Jimp-specific operations.

### `MockImageAdapter.ts`
- **Description:** 
  - Mock implementation for testing without performing real image processing.
  - Simulates image data and operations.
- **Key Methods:** Overrides methods from `BaseImageAdapter` to work with mock data.

## 2. Core Logic

### `Cell.ts`
- **Description:** 
  - Represents a rectangular region within an image.
  - Provides methods to analyze pixel data, such as calculating average color and entropy.
- **Key Methods:**
  - `hasPixels()`: Checks if the cell contains any non-transparent pixels.
  - `getAverageColor()`: Calculates the average color of the cell.
  - `getEntropy()`: Calculates the entropy of the cell's colors.
  - `getRGBValuesForCoordinates()`: Retrieves RGB values for specific coordinates within the cell.

### `partition.ts`
- **Description:** 
  - Contains functions to partition an image into smaller cells.
- **Key Functions:**
  - `partitionImageIntoCells()`: Divides the image into cells based on specified dimensions.

## 3. Managers

### `CellManager.ts`
- **Description:** 
  - Singleton class responsible for managing `Cell` instances.
  - Implements design patterns such as Singleton, Factory, and Repository.
- **Key Methods:**
  - `getInstance()`: Retrieves the single instance of `CellManager`.
  - `addCell()`: Adds a cell to the manager.
  - `getCell()`: Retrieves a cell based on coordinates.
  - `removeCell()`: Removes a specific cell.
  - `partitionCellsFromImage()`: Creates and partitions cells from an image.

## 4. Entry Point

### `index.ts`
- **Description:** 
  - The main entry point of the application.
  - Initializes and orchestrates the creation and management of cells.

## 5. Testing

### `Cell.test.ts`
- **Description:** 
  - Contains tests for cell partitioning and operations.
  
### `adapters/jimpAdapter.test.ts`
- **Description:** 
  - Contains tests for the `JimpAdapter`.

### `testUtils.ts`
- **Description:** 
  - Provides utility functions to assist in testing, such as initializing adapters and cleaning up test images.
