// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, ebool, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

import {ERC7984Coin} from "./ERC7984Coin.sol";

contract TaskGame is SepoliaConfig {
    struct Task {
        string name;
        string description;
        uint64 reward;
    }

    uint8 public constant TASK_COUNT = 5;

    ERC7984Coin public immutable coin;

    Task[] private _tasks;
    mapping(address player => bool) private _players;
    mapping(address player => euint64) private _playerTaskMask;

    error PlayerNotRegistered();
    error AlreadyJoined();

    event PlayerJoined(address indexed player);
    event TaskClaimProcessed(address indexed player, euint64 encryptedTaskId, euint64 reward, euint64 updatedMask);

    constructor(ERC7984Coin coin_) {
        coin = coin_;

        _tasks.push(Task("Initiation", "Connect your wallet to join the adventure.", 100_000000));
        _tasks.push(Task("Scout", "Explore the quest board to learn about tasks.", 150_000000));
        _tasks.push(Task("Cipher", "Encrypt your first task identifier with Zama.", 200_000000));
        _tasks.push(Task("Strategist", "Share the quest board with a fellow player.", 250_000000));
        _tasks.push(Task("Champion", "Complete every encrypted objective.", 300_000000));
    }

    function joinGame() external {
        if (_players[msg.sender]) {
            revert AlreadyJoined();
        }

        _players[msg.sender] = true;

        euint64 mask = _playerTaskMask[msg.sender];
        if (!FHE.isInitialized(mask)) {
            mask = FHE.asEuint64(0);
            _playerTaskMask[msg.sender] = mask;
        }

        FHE.allowThis(mask);
        FHE.allow(mask, msg.sender);

        emit PlayerJoined(msg.sender);
    }

    function claimTask(externalEuint64 encryptedTaskId, bytes calldata inputProof) external {
        if (!_players[msg.sender]) {
            revert PlayerNotRegistered();
        }

        euint64 taskId = FHE.fromExternal(encryptedTaskId, inputProof);

        euint64 currentMask = _playerTaskMask[msg.sender];
        if (!FHE.isInitialized(currentMask)) {
            currentMask = FHE.asEuint64(0);
        }

        euint64 updatedMask = currentMask;
        euint64 reward = FHE.asEuint64(0);

        for (uint8 i = 0; i < TASK_COUNT; ++i) {
            euint64 expectedId = FHE.asEuint64(uint64(i + 1));
            ebool matches = FHE.eq(taskId, expectedId);

            euint64 bit = FHE.shl(FHE.asEuint64(1), i);
            euint64 claimedBit = FHE.and(currentMask, bit);
            ebool alreadyClaimed = FHE.ne(claimedBit, FHE.asEuint64(0));
            ebool claimable = FHE.and(matches, FHE.not(alreadyClaimed));

            euint64 rewardForTask = FHE.asEuint64(_tasks[i].reward);
            reward = FHE.select(claimable, rewardForTask, reward);

            euint64 maskWithTask = FHE.or(currentMask, bit);
            updatedMask = FHE.select(claimable, maskWithTask, updatedMask);
        }

        _playerTaskMask[msg.sender] = updatedMask;
        FHE.allowThis(updatedMask);
        FHE.allow(updatedMask, msg.sender);

        ebool shouldMint = FHE.ne(reward, FHE.asEuint64(0));
        FHE.allow(reward, address(coin));
        FHE.allow(shouldMint, address(coin));
        coin.mintReward(msg.sender, reward, shouldMint);

        emit TaskClaimProcessed(msg.sender, taskId, reward, updatedMask);
    }

    function getTasks() external view returns (Task[] memory) {
        Task[] memory tasksCopy = new Task[](_tasks.length);
        for (uint256 i = 0; i < _tasks.length; ++i) {
            tasksCopy[i] = _tasks[i];
        }
        return tasksCopy;
    }

    function getTask(uint8 index) external view returns (Task memory) {
        require(index < _tasks.length, "Task out of range");
        return _tasks[index];
    }

    function hasJoined(address player) external view returns (bool) {
        return _players[player];
    }

    function getPlayerTaskMask(address player) external view returns (euint64) {
        return _playerTaskMask[player];
    }
}
