// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, ebool, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ERC7984Coin is ERC7984, SepoliaConfig, Ownable {
    address public minter;

    error UnauthorizedMinter();

    constructor() ERC7984("COIN", "COIN", "") Ownable(msg.sender) {}

    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "Invalid minter");
        minter = newMinter;
    }

    function mintReward(address to, euint64 amount, ebool shouldMint) external returns (euint64) {
        if (msg.sender != minter) {
            revert UnauthorizedMinter();
        }

        euint64 award = FHE.select(shouldMint, amount, FHE.asEuint64(0));
        return _mint(to, award);
    }
}
