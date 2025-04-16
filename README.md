# Interactive Banzai Tree Animation

An interactive 3D banzai tree that animates as you scroll down the page, built with Three.js and GSAP.

## Features

- 3D banzai tree model loaded from `bonesai.glb`
- Scroll-triggered animations
- Interactive camera movements
- Seasonal color changes
- Dynamic growth animations

## Getting Started

### Prerequisites

- Node.js (version 14 or later recommended)
- npm or yarn

### Installation

1. Clone this repository or download the source code
2. Navigate to the project directory
3. Install dependencies

```bash
npm install
# or
yarn
```

### Running the Project

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will open automatically in your default browser, typically at http://localhost:5173.

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## How It Works

As you scroll down the page, the banzai tree undergoes various transformations:

1. **Introduction** - The tree rotates and slightly bounces
2. **Growth** - The tree scales up and starts a gentle swaying motion
3. **Seasonal Changes** - The tree's colors change to autumn-like tones
4. **Harmony** - The camera angle shifts to view the tree from above
5. **Full Bloom** - The tree scales further and colors shift to vibrant spring-like green

## Technologies Used

- Three.js - 3D rendering
- GSAP and ScrollTrigger - Animation and scroll-based triggers
- Vite - Development and build tool 