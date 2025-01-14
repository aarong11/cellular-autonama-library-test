# Architecture Overview

The Cellular Automata project is structured to efficiently manage image processing using a modular and extensible architecture. Below is an overview of the main layers and their interactions:

## Layers

1. **Adapters Layer (`src/image/adapters/`)**
   - **Purpose:** Abstract image processing operations.
   - **Components:** 
     - `BaseImageAdapter`: Abstract class defining the contract for image adapters.
     - `JimpAdapter`: Concrete implementation using the Jimp library.
     - `MockImageAdapter`: Mock implementation for testing purposes.

2. **Core Logic (`src/image/`)**
   - **Purpose:** Implements the core functionality for image partitioning and cell operations.
   - **Components:** 
     - `Cell.ts`: Represents a region within an image and provides methods for analysis.
     - `partition.ts`: Contains functions to partition images into cells.

3. **Managers (`src/managers/`)**
   - **Purpose:** Manage the lifecycle and operations of cells.
   - **Components:** 
     - `CellManager.ts`: Singleton class responsible for creating, retrieving, and managing cells.

4. **Entry Point (`src/index.ts`)**
   - **Purpose:** Initializes and orchestrates the application.

5. **Testing (`tests/`)**
   - **Purpose:** Contains automated tests to ensure code reliability.
   - **Components:** 
     - `Cell.test.ts`: Tests for cell partitioning and operations.
     - `adapters/jimpAdapter.test.ts`: Tests for the JimpAdapter.
     - `testUtils.ts`: Utility functions for testing.

## Workflow

1. **Initialization:** The application starts from `src/index.ts`, which initializes the necessary components.
2. **Image Loading:** An image is loaded using an adapter (`JimpAdapter` or `MockImageAdapter`).
3. **Partitioning:** The image is partitioned into cells using `partitionImageIntoCells`.
4. **Management:** `CellManager` manages the created cells, allowing for operations like retrieval and removal.
5. **Processing:** Each `Cell` can perform operations such as calculating average color or entropy.
6. **Testing:** Automated tests ensure each component functions as expected.
