# 🎮 Hidden Game - Encrypted Quest Board

[![License: BSD-3-Clause-Clear](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.27-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![Powered by FHEVM](https://img.shields.io/badge/Powered%20by-FHEVM-blueviolet)](https://docs.zama.ai/fhevm)

A cutting-edge blockchain game that leverages **Fully Homomorphic Encryption (FHE)** to enable truly private on-chain gaming. Complete encrypted quests, earn confidential rewards, and experience the future of privacy-preserving Web3 applications.

---

## 🌟 Overview

**Hidden Game** is an interactive blockchain-based quest completion game built on Ethereum using [Zama's FHEVM protocol](https://docs.zama.ai/fhevm). Players embark on encrypted missions, claiming tasks while maintaining complete privacy over their progress and rewards. The game demonstrates practical applications of Fully Homomorphic Encryption in gaming by encrypting task completion status and player rewards—allowing smart contracts to compute on encrypted data without ever decrypting it.

### What Makes This Project Unique?

- **🔐 Full Privacy by Design**: Task claims, completion status, and token balances remain encrypted on-chain
- **🧮 Compute on Encrypted Data**: Smart contracts perform logic on encrypted values using FHE operations
- **🎯 Zero Knowledge Leakage**: No observer can determine which tasks you've completed or how many tokens you've earned
- **🏆 Confidential Tokens**: Rewards are minted as ERC7984 confidential tokens with encrypted balances
- **🔓 User-Controlled Decryption**: Only you can decrypt your progress through cryptographic signatures

---

## 🎯 Problem Statement

Traditional blockchain applications expose all transaction data publicly, creating significant privacy concerns:

1. **Transaction Transparency**: Every action (game progress, token transfers, etc.) is visible to anyone
2. **Metadata Leakage**: Competitors and observers can analyze patterns in gameplay and rewards
3. **Front-Running Vulnerabilities**: Public pending transactions enable exploitation by bots
4. **User Privacy**: Players cannot keep their achievements, balances, or strategies confidential
5. **Limited Use Cases**: Privacy-sensitive applications (gaming, finance, healthcare) struggle on public blockchains

### How Hidden Game Solves These Problems

**Hidden Game** leverages **Fully Homomorphic Encryption (FHE)** to enable:

- ✅ **Encrypted Task Claims**: Submit task completions without revealing which task to observers
- ✅ **Private Reward Distribution**: Token rewards minted based on encrypted validation
- ✅ **Hidden Game State**: Your progress remains encrypted until you choose to decrypt it
- ✅ **Front-Running Prevention**: Encrypted inputs prevent transaction analysis before execution
- ✅ **Selective Disclosure**: You control when and what information to reveal

---

## 🚀 Key Features

### Game Mechanics

#### 🎮 Five Encrypted Quests

Players complete five progressive missions, each with increasing difficulty and rewards:

| Quest # | Name | Description | Reward |
|---------|------|-------------|--------|
| 1 | **Initiation** | Connect your wallet to join the adventure | 100 COIN |
| 2 | **Scout** | Explore the quest board to learn about tasks | 150 COIN |
| 3 | **Cipher** | Encrypt your first task identifier with Zama | 200 COIN |
| 4 | **Strategist** | Share the quest board with a fellow player | 250 COIN |
| 5 | **Champion** | Complete every encrypted objective | 300 COIN |

**Total Possible Rewards**: 1,000 COIN

#### 🔒 Privacy-Preserving Task System

1. **Join the Game**: Register your wallet and initialize encrypted progress tracking
2. **Encrypt Task ID**: Use Zama's FHE SDK to encrypt task identifiers client-side
3. **Submit Claim**: Send encrypted task ID with cryptographic proof to smart contract
4. **FHE Validation**: Contract verifies eligibility and prevents double-claims—all on encrypted data
5. **Confidential Rewards**: ERC7984 tokens minted directly to your encrypted balance
6. **Decrypt Progress**: Sign a decryption request to reveal your achievements locally

### Technical Architecture

#### Smart Contracts

**🎲 TaskGame.sol**
- Main game orchestration contract
- Manages 5 predefined quests with rewards
- Stores encrypted task completion bitmask per player (`euint64`)
- Processes encrypted task claims using FHE operations:
  - `FHE.eq()` - Encrypted equality checks
  - `FHE.and()`, `FHE.or()` - Encrypted bitwise operations
  - `FHE.select()` - Encrypted conditional selection
- Prevents double-claiming via encrypted bitmask logic
- Emits events for player actions while preserving privacy

**💰 ERC7984Coin.sol**
- Confidential token implementation (OpenZeppelin ERC7984)
- Encrypted balance storage for all holders
- Conditional minting based on encrypted authorization (`ebool`)
- Only TaskGame contract authorized to mint rewards
- Supports confidential transfers between players

#### Frontend Application

**⚡ Modern React Stack**
- Built with **React 19** and **TypeScript** for type safety
- **Vite** for lightning-fast development and optimized builds
- **Wagmi v2** hooks for seamless Ethereum integration
- **RainbowKit** for beautiful wallet connection UX
- **TanStack React Query** for efficient data fetching and caching

**🔐 Encryption Integration**
- Custom `useZamaInstance()` hook initializes Zama FHE SDK
- Client-side encryption of task IDs before submission
- EIP-712 signature-based decryption requests
- Secure keypair generation for decryption operations
- Local storage of decrypted values (never sent to chain)

**🎨 User Interface**
- **Player Dashboard**: Wallet status, quest enrollment, balance display
- **Quest Log**: Interactive cards for all five tasks with status indicators
- **Claim Flow**: Guided encryption → submission → feedback → decryption
- **Dark Theme**: Cyberpunk-inspired design with glass-morphism effects

---

## 🛠️ Technology Stack

### Blockchain & Smart Contracts

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.27 | Smart contract development language |
| **Hardhat** | 2.26.0 | Development framework & testing environment |
| **FHEVM (Zama)** | 0.8.0 | Fully Homomorphic Encryption library |
| **OpenZeppelin** | Latest | Standard & confidential contract implementations |
| **Ethers.js** | 6.15.0 | Web3 library for contract interactions |
| **TypeChain** | 8.3.2 | TypeScript bindings for type-safe contracts |

**FHE Ecosystem**:
- `@fhevm/solidity` - Core FHE operations in Solidity
- `@fhevm/hardhat-plugin` - Hardhat integration for FHE development
- `@zama-fhe/relayer-sdk` - Client-side encryption and decryption SDK

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | Modern UI library for component-based architecture |
| **TypeScript** | 5.8.3 | Type-safe JavaScript for robust development |
| **Vite** | 7.1.6 | Next-generation build tool & dev server |
| **Wagmi** | 2.17.0 | React hooks for Ethereum wallet integration |
| **RainbowKit** | 2.2.8 | Wallet connection UI with multi-wallet support |
| **TanStack Query** | 5.89.0 | Powerful data fetching & state management |
| **Viem** | 2.37.6 | Type-safe Ethereum library for read operations |

### Development & Testing

- **Chai** (4.5.0) - Assertion library for comprehensive testing
- **Mocha** (11.7.1) - JavaScript test runner
- **Hardhat Network** - Local blockchain simulation
- **ESLint** & **Prettier** - Code quality and formatting
- **Solhint** - Solidity-specific linting
- **Hardhat Deploy** - Automated deployment pipeline

### Deployment Targets

- **Local Development**: Hardhat Network & Anvil
- **Testnet**: Sepolia (via Infura RPC)
- **Contract Verification**: Etherscan API integration

---

## 🏗️ Architecture & Design

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PLAYER JOURNEY                           │
└─────────────────────────────────────────────────────────────────┘

1. JOIN GAME
   User → Connect Wallet → GameApp.joinGame()
   → TaskGame.joinGame() (blockchain tx)
   → Initialize encrypted mask (euint64 = 0)
   → Emit PlayerJoined event
   → UI updates with React Query

2. CLAIM TASK
   User → Select Task → useZamaInstance.createEncryptedInput()
   → Encrypt task ID locally (client-side)
   → Generate input proof
   → GameApp.claimTask()
   → TaskGame.claimTask(encryptedTaskId, proof) (blockchain tx)
   → FHE operations validate encrypted claim:
       • Check if task ID matches (encrypted equality)
       • Verify not already claimed (encrypted bitmask check)
       • Calculate reward (encrypted conditional)
       • Update mask (encrypted bitwise OR)
   → ERC7984Coin.mintReward() (conditional encrypted mint)
   → Emit TaskClaimProcessed event
   → UI invalidates queries & refetches

3. DECRYPT PROGRESS
   User → Click "Decrypt Progress"
   → Generate ephemeral keypair (client-side)
   → Create EIP-712 decryption request
   → Sign with wallet (authorization)
   → useZamaInstance.userDecrypt()
   → Fetch encrypted handles from contracts
   → Zama relayer decrypts values
   → Display decrypted mask & balance locally
   → Data never leaves client
```

### Smart Contract Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        TaskGame.sol                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  State Variables                                       │  │
│  │  • Task[] _tasks (5 quests with name/desc/reward)     │  │
│  │  • mapping(address => bool) _players                  │  │
│  │  • mapping(address => euint64) _playerTaskMask        │  │
│  │  • ERC7984Coin coin (immutable reference)             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Core Functions                                        │  │
│  │  • joinGame() - Register player, init encrypted mask  │  │
│  │  • claimTask() - Process encrypted claim with FHE     │  │
│  │  • getTasks() - Return all quest details              │  │
│  │  • hasJoined() - Check registration                   │  │
│  │  • getPlayerTaskMask() - Get encrypted progress       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  FHE Operations in claimTask()                         │  │
│  │  1. FHE.fromExternal() - Import encrypted input       │  │
│  │  2. FHE.eq() - Check if taskId matches expected       │  │
│  │  3. FHE.and() - Check bitmask for previous claim      │  │
│  │  4. FHE.ne() - Verify bit not set                     │  │
│  │  5. FHE.not() - Negate boolean                        │  │
│  │  6. FHE.select() - Conditional reward/mask update     │  │
│  │  7. FHE.or() - Set bit in updated mask                │  │
│  │  8. FHE.allow() - Grant decryption permissions        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ mintReward()
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                      ERC7984Coin.sol                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Confidential Token (ERC7984)                          │  │
│  │  • Encrypted balances for all holders                 │  │
│  │  • Only minter (TaskGame) can mint                    │  │
│  │  • mintReward(address, euint64, ebool)                │  │
│  │    - Conditional mint based on encrypted shouldMint   │  │
│  │    - Uses FHE.select() for encrypted logic            │  │
│  │  • confidentialBalanceOf() - Returns encrypted handle │  │
│  │  • confidentialTransfer() - Encrypted token transfers │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Frontend Component Hierarchy

```
App.tsx (Providers)
  ├── WagmiProvider (Web3 wallet integration)
  ├── QueryClientProvider (Data fetching & caching)
  └── RainbowKitProvider (Wallet UI)
       │
       └── GameApp.tsx (Main Game Logic)
            ├── Header.tsx
            │    ├── Title: "Encrypted Quest Board"
            │    └── ConnectButton (RainbowKit)
            │
            ├── Player Panel Section
            │    ├── Connection Status
            │    ├── Join Game Button
            │    ├── Decrypt Progress Button
            │    └── COIN Balance Display
            │
            └── Quest Log Section
                 └── Task Grid (5 TaskCard components)
                      ├── Task ID & Status Badge
                      ├── Quest Name & Description
                      ├── Reward Amount
                      └── Claim Button
```

---

## 🔒 Security & Privacy Features

### Encryption Guarantees

1. **Client-Side Encryption**: Task IDs encrypted locally before transmission using Zama FHE SDK
2. **Zero Plaintext Exposure**: Contracts never see unencrypted task claims
3. **Encrypted State Storage**: All sensitive data (mask, balance) stored as `euint64` ciphertexts
4. **Homomorphic Operations**: Smart contracts compute on ciphertexts without decryption
5. **User-Authorized Decryption**: EIP-712 signatures required for decryption requests

### Smart Contract Security

- **Access Control**: Only authorized minter can create new COIN tokens
- **Double-Claim Prevention**: Encrypted bitmask prevents claiming same task twice
- **Registration Guard**: Players can only join once per address
- **Input Validation**: External encrypted inputs validated with proofs
- **Permission Management**: Explicit ACL grants for encrypted data access

### Frontend Security

- **Type Safety**: TypeScript prevents runtime type errors
- **Secure Key Generation**: Ephemeral keypairs for decryption (not reused)
- **Local Decryption**: Decrypted values never transmitted to blockchain
- **Signature Verification**: EIP-712 ensures wallet ownership for decryption
- **Error Boundaries**: Graceful handling of encryption/decryption failures

---

## 📊 Advantages Over Traditional Blockchain Games

| Feature | Traditional Games | Hidden Game (FHE) |
|---------|-------------------|-------------------|
| **Progress Visibility** | Public on-chain | Encrypted |
| **Token Balances** | Transparent | Confidential (ERC7984) |
| **Front-Running Risk** | High (MEV vulnerable) | Low (encrypted inputs) |
| **Privacy** | None (all data public) | Complete (user-controlled) |
| **Strategy Leakage** | Visible to competitors | Hidden from observers |
| **Metadata Analysis** | Trivial | Impossible without decryption |
| **Selective Disclosure** | Not possible | User decides what to reveal |
| **Game Theory** | Limited by transparency | Richer with hidden information |

### Use Cases Enabled by FHE

This architecture can be extended to:

- **🎰 Private Gaming**: Poker, blackjack, lotteries with hidden hands/numbers
- **🏦 Confidential DeFi**: Private trading, hidden order books, dark pools
- **🗳️ Secure Voting**: Anonymous ballots with verifiable tallying
- **🏥 Healthcare**: Medical records with selective disclosure
- **🔐 Enterprise**: Confidential supply chain & business logic

---

## 📁 Project Structure

```
hidden-game/
├── contracts/
│   ├── TaskGame.sol              # Main game contract (quest logic)
│   └── ERC7984Coin.sol           # Confidential reward token
│
├── deploy/
│   └── deploy.ts                 # Automated deployment script
│
├── tasks/
│   └── TaskGame.ts               # Hardhat CLI custom tasks
│
├── test/
│   └── TaskGame.ts               # Comprehensive test suite
│
├── app/                          # React frontend
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Provider configuration
│   │   ├── components/
│   │   │   ├── Header.tsx        # App header with ConnectButton
│   │   │   └── GameApp.tsx       # Main game component
│   │   ├── config/
│   │   │   ├── wagmi.ts          # Wagmi/Web3 configuration
│   │   │   └── contracts.ts      # Contract addresses & ABIs
│   │   ├── hooks/
│   │   │   ├── useZamaInstance.ts     # FHE SDK initialization
│   │   │   └── useEthersSigner.ts     # Convert Viem client to Ethers signer
│   │   └── styles/               # CSS modules
│   │       ├── GameApp.css
│   │       ├── Header.css
│   │       ├── TaskCard.css
│   │       └── PlayerPanel.css
│   ├── vite.config.ts            # Vite build configuration
│   ├── tsconfig.json             # TypeScript config
│   └── package.json              # Frontend dependencies
│
├── hardhat.config.ts             # Hardhat configuration
├── tsconfig.json                 # TypeScript config (contracts)
├── package.json                  # Root dependencies & scripts
├── .env                          # Environment variables (API keys)
├── .eslintrc.yml                 # ESLint rules
├── .prettierrc.yml               # Prettier formatting
├── .solhint.json                 # Solidity linting rules
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **npm**: v7.0.0 or higher
- **Git**: For cloning the repository
- **Wallet**: MetaMask or compatible Web3 wallet
- **Testnet ETH**: Sepolia ETH for gas (from [Sepolia faucet](https://sepoliafaucet.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/hidden-game.git
cd hidden-game
```

2. **Install contract dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd app
npm install
cd ..
```

4. **Configure environment variables**

Create or edit `.env` file in the root directory:

```env
# Deployer private key (without 0x prefix)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Infura API key for Sepolia network
INFURA_API_KEY=your_infura_api_key

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

⚠️ **Security Warning**: Never commit your `.env` file or share private keys publicly!

5. **Compile smart contracts**

```bash
npm run compile
```

This generates:
- Compiled contract artifacts in `artifacts/`
- TypeChain type definitions in `types/`

6. **Run tests**

```bash
npm test
```

Expected output: All tests passing with gas usage reports

---

## 🏗️ Deployment

### Local Development (Hardhat Network)

1. **Start local blockchain**

```bash
npm run chain
```

This starts a Hardhat node at `http://127.0.0.1:8545`

2. **Deploy contracts (new terminal)**

```bash
npm run deploy:localhost
```

3. **Update frontend contract addresses**

Edit `app/src/config/contracts.ts` with deployed addresses:

```typescript
export const TASK_GAME_ADDRESS = '0x...' as const;
export const COIN_ADDRESS = '0x...' as const;
```

4. **Start frontend**

```bash
cd app
npm run dev
```

Open `http://localhost:5173` in your browser

### Sepolia Testnet Deployment

1. **Get Sepolia ETH**

Visit [Sepolia Faucet](https://sepoliafaucet.com/) and request test ETH

2. **Deploy to Sepolia**

```bash
npm run deploy:sepolia
```

3. **Verify contracts on Etherscan**

```bash
npm run verify:sepolia
```

4. **Update frontend for Sepolia**

Edit `app/src/config/contracts.ts` and `app/src/config/wagmi.ts` to point to Sepolia contracts

5. **Build and deploy frontend**

```bash
cd app
npm run build
```

Deploy `app/dist/` folder to hosting service (Vercel, Netlify, etc.)

---

## 🎮 How to Play

### Step-by-Step Guide

#### 1. Connect Wallet

- Visit the deployed frontend
- Click **"Connect Wallet"** button in the header
- Select your Web3 wallet (MetaMask, WalletConnect, etc.)
- Approve the connection

#### 2. Join the Quest

- Click **"Join the Quest"** button in the Adventurer Console
- Approve the transaction in your wallet (gas required)
- Wait for confirmation (~15 seconds on Sepolia)
- Status updates to "Enlisted adventurer"

#### 3. Claim Tasks

For each quest:

1. Click **"Claim Task"** button on a quest card
2. Frontend encrypts the task ID locally
3. Approve the transaction (contains encrypted data + proof)
4. Wait for blockchain confirmation
5. Feedback shows "Task processed. Decrypt to view latest rewards."

**Note**: You cannot claim the same task twice (enforced by encrypted bitmask)

#### 4. Decrypt Progress

- Click **"Decrypt Progress"** button
- Frontend generates a decryption keypair
- Sign an EIP-712 decryption request (no gas cost)
- View your completed tasks and COIN balance

**Privacy Note**: Decryption happens locally—decrypted values never touch the blockchain

#### 5. Complete All Quests

- Claim all 5 tasks to earn maximum COIN rewards
- Share your achievement with friends (without revealing on-chain!)

---

## 📜 Available Scripts

### Root (Contract Development)

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run Hardhat test suite |
| `npm run coverage` | Generate test coverage report |
| `npm run lint` | Lint Solidity and TypeScript files |
| `npm run lint:sol` | Lint Solidity contracts only |
| `npm run lint:ts` | Lint TypeScript files only |
| `npm run prettier:check` | Check code formatting |
| `npm run prettier:write` | Auto-format all files |
| `npm run clean` | Remove build artifacts & cache |
| `npm run chain` | Start local Hardhat node |
| `npm run deploy:localhost` | Deploy to local network |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run verify:sepolia` | Verify contracts on Etherscan |
| `npm run test:sepolia` | Run tests on Sepolia network |

### Frontend (`app/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint frontend TypeScript |

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/TaskGame.ts

# Run tests with gas reporting
REPORT_GAS=true npm test

# Run tests on Sepolia
npm run test:sepolia
```

### Test Coverage

```bash
npm run coverage
```

Coverage report generated in `coverage/` directory

### Testing Encrypted Operations

The test suite includes:

- ✅ Player registration and duplicate prevention
- ✅ Encrypted task claim with valid task ID
- ✅ Double-claim prevention via encrypted bitmask
- ✅ Invalid task ID rejection (encrypted comparison)
- ✅ Confidential token minting verification
- ✅ Encrypted balance updates
- ✅ Decryption authorization and signature validation

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
   - Add tests for new functionality
   - Ensure all tests pass: `npm test`
   - Lint your code: `npm run lint`
   - Format code: `npm run prettier:write`

4. **Commit with conventional commits**

```bash
git commit -m "feat: add encrypted leaderboard"
```

5. **Push to your fork**

```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**

### Areas for Contribution

- 🎮 **New Game Mechanics**: Additional encrypted features (leaderboards, multiplayer, achievements)
- 🔒 **Security Audits**: Review smart contract security and FHE implementation
- 🎨 **UI/UX Improvements**: Enhanced frontend design and user experience
- 📚 **Documentation**: Tutorials, guides, and API documentation
- 🧪 **Testing**: Additional test cases and coverage improvements
- 🌐 **Internationalization**: Multi-language support

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ 5 encrypted quests with confidential rewards
- ✅ ERC7984 confidential token implementation
- ✅ React frontend with Zama FHE SDK integration
- ✅ Sepolia testnet deployment

### Phase 2: Enhanced Gameplay (Q2 2025)
- 🔄 Dynamic quest generation
- 🔄 Encrypted leaderboard with privacy-preserving rankings
- 🔄 Multiplayer collaborative quests
- 🔄 NFT achievements with encrypted attributes
- 🔄 Quest expiration and time-based challenges

### Phase 3: Advanced Features (Q3 2025)
- 🔮 Encrypted PvP battles
- 🔮 Confidential crafting system
- 🔮 Private guilds with encrypted membership
- 🔮 Cross-chain encrypted state (via FHE bridges)
- 🔮 Mobile app with React Native

### Phase 4: Mainnet & Ecosystem (Q4 2025)
- 🚀 Mainnet deployment (Ethereum + L2s)
- 🚀 SDK for developers to build FHE games
- 🚀 Marketplace for encrypted in-game assets
- 🚀 DAO governance for game parameters
- 🚀 Integration with other FHE protocols

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Gas Costs**: FHE operations are more expensive than plaintext computations (~2-5x gas)
2. **Network Support**: Currently only deployed on Sepolia testnet (mainnet coming soon)
3. **Decryption Latency**: Decryption requests require relayer interaction (~2-3 seconds)
4. **Browser Compatibility**: Requires modern browsers with WebAssembly support
5. **Mobile Support**: Limited mobile wallet compatibility (working on React Native app)

### Workarounds

- **Gas Optimization**: Batch multiple task claims in future versions
- **Caching**: Frontend caches decrypted values to reduce relayer calls
- **Progressive Enhancement**: Graceful fallbacks for unsupported browsers

---

## 📚 Documentation & Resources

### Official Documentation

- **Zama FHEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Documentation**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **OpenZeppelin Docs**: [https://docs.openzeppelin.com](https://docs.openzeppelin.com)
- **Wagmi Documentation**: [https://wagmi.sh](https://wagmi.sh)

### Related Papers & Research

- [Zama Whitepaper: FHEVM](https://github.com/zama-ai/fhevm)
- [ERC7984: Confidential Tokens](https://eips.ethereum.org/EIPS/eip-7984)
- [Fully Homomorphic Encryption Explained](https://en.wikipedia.org/wiki/Homomorphic_encryption)

### Community

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/hidden-game/issues)
- **Zama Discord**: [https://discord.gg/zama](https://discord.gg/zama)
- **Twitter/X**: [@ZamaFHE](https://twitter.com/ZamaFHE)

---

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**.

```
Copyright (c) 2025 Hidden Game Contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of the copyright holder nor the names of its contributors
  may be used to endorse or promote products derived from this software
  without specific prior written permission.
```

See [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

- **[Zama](https://zama.ai/)** - For pioneering FHEVM technology
- **[OpenZeppelin](https://openzeppelin.com/)** - For secure smart contract libraries
- **[Hardhat](https://hardhat.org/)** - For exceptional development tooling
- **[Wagmi](https://wagmi.sh/)** & **[RainbowKit](https://rainbowkit.com/)** - For Web3 React infrastructure
- **Community Contributors** - For feedback, testing, and improvements

---

## 🔗 Links

- **Website**: [Coming Soon]
- **GitHub**: [https://github.com/yourusername/hidden-game](https://github.com/yourusername/hidden-game)
- **Demo**: [https://hidden-game.netlify.app](https://hidden-game.netlify.app) (Sepolia testnet)
- **Documentation**: [https://docs.hidden-game.io](https://docs.hidden-game.io) (Coming Soon)

---

## 💬 Questions?

Have questions or need help?

- 💬 **Discord**: Join our community server (link coming soon)
- 📧 **Email**: support@hidden-game.io
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/hidden-game/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/hidden-game/discussions)

---

<div align="center">

**Built with ❤️ using Fully Homomorphic Encryption**

[⭐ Star this repo](https://github.com/yourusername/hidden-game) • [🐛 Report Bug](https://github.com/yourusername/hidden-game/issues) • [✨ Request Feature](https://github.com/yourusername/hidden-game/issues)

</div>
