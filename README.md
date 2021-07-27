# Cutie-Tanks

This is a arcade game where the last one alive wins.  
The players play as very cute tanks, and can shoot an unlimited amount of bullets / bombs at eachother.  
A player can only take 10 damage before dying. The last one standing wins. Matches are around 1 to 2 minutes and very chaotic. For now there are 3 levels to choose from, but I plan on making some more.

[Play on itch.io](https://robijntje.itch.io/cutie-tanks)

Also, there are skins. To join a game press down on the player select screen, and then use down to select a skin.

The game had multiple gamemodes:

- Single Match:  
play one match and return to the skin and level selection screen for another one.
- Freeplay:  
the same as Single Match, but you can customize all stats for players.
- Duos/Teams:  
play in teams or duos against others.

## Installation

It is possible to run the game locally using Electron. I have prebuilt packages available for Arch Linux and a Lutris install for other distros. If you want to run it on MacOS or Windows, you can build it yourself using for example Electron Forge.

### Lutris

There is a Lutris version available which will install the latest version for a single user.  
[Download using Lutris](https://lutris.net/games/cutietanks/)

### AUR

There are two AUR packages available for Arch Linux:

- **cutie-tanks:**  
install latest stable tag from GitHub system-wide

- **cutie-tanks-git:**  
clones this repo and builds it using parcel

AUR packages can be installed using an AUR helper like `yay` or `paru`:

```
yay -S cutie-tanks
```

### Build from source

1. Clone this repo

```
git clone https://github.com/RobinBoers/cutie-tanks
```

2. Install npm

```
sudo apt install npm
sudo pacman -S npm
```

3. Install dependencies

```
npm install
```

5. Build

```
npm run build
```

## Development

Make sure you have parcel and nodejs installed:

```
npm install -g parcel-bundler
```

The game uses Phaser 3 Scenes for the different "states" the game can be in. These are:

- **Loading:**  
for loading all the assets
- **Main menu:**  
to connect controllers and display the logo
- **Mode select**:  
to select a game mode
- **Settings**:  
to configure settings for Freeplay Mode
- **Player select:**  
to join the game and select a skin
- **In-Game:**  
to play the game
- **Winner:**  
shows the winner (the last one standing)

To test the game:

```
npm start
```

To package for production:

```
npm run build
```

## Controls
The game is designed with a xbox controller in mind, but any controller should work. To move use the left analog stick. To aim use the right analog stick. To shoot use the analog right trigger.

![](artwork/controls.png)
