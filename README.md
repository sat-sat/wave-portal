# Send a "Wave" and a message on the Ethereum blockchain

This project demonstrates how the Ethereum blockchain works by adding a simple message as a transaction. Here is a list of features implemented in this project.

### Wave Contract

- Track total waves on the blockchain
- NewWave event emitter
- Wave debounce of 30 seconds (spam prevention)
- Lottery system that will award wavers with 0.0001 ether (50% chance)
- Method for providing all wave data

### App.js

- Check if wallet is connected (mainly checks for MetaMask connection)
- Option to connect wallet if not currently connected
- Send a message
- Listen to `NewWave` event to append successfully mined wave transactions

# Setup commands

```shell
yarn start
```

# Misc

The project is setup to run on the rinkeby testnet only. All wallet networks should be set to rinkeby to interaction with this project.
