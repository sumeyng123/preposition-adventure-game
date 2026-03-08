# Phaser Game

## Overview
This project is a 2D game built using Phaser 3, designed to help players learn prepositions through interactive gameplay. Players navigate through different levels, completing tasks that involve using prepositions correctly.

## Project Structure
```
phaser-game
├── src
│   ├── index.html          # Main HTML entry point for the game
│   ├── main.js             # Initializes the Phaser game instance and configuration
│   ├── scenes              # Contains different game scenes
│   │   ├── MainMenuScene.js  # Main menu with title and buttons
│   │   ├── CityLevelScene.js  # City level with simple preposition tasks
│   │   ├── ForestLevelScene.js # Forest level with medium difficulty tasks
│   │   └── JungleLevelScene.js # Jungle level with higher difficulty tasks
│   ├── assets              # Contains game assets
│   │   ├── images         # Image assets (backgrounds, characters, UI)
│   │   ├── audio          # Audio assets (sound effects, music)
│   │   └── fonts          # Font files for text rendering
│   └── utils              # Utility functions and classes
│       └── ScoreSystem.js  # Manages the scoring system and feedback
├── package.json            # npm configuration file
├── README.md               # Project documentation
└── .gitignore              # Files and directories to ignore in version control
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd phaser-game
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Open `index.html` in a web browser to play the game.

## Gameplay
- Players start at the main menu where they can choose to start the game or view instructions.
- Each level presents a series of tasks involving prepositions that players must complete to progress.
- Players receive feedback on their performance, with points awarded for correct answers.

## Credits
- Developed using Phaser 3.
- Special thanks to the contributors and the open-source community for their support.