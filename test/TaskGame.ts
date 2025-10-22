import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

import type { ERC7984Coin, TaskGame } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployContracts() {
  const coinFactory = await ethers.getContractFactory("ERC7984Coin");
  const coin = (await coinFactory.deploy()) as ERC7984Coin;
  await coin.waitForDeployment();

  const gameFactory = await ethers.getContractFactory("TaskGame");
  const game = (await gameFactory.deploy(await coin.getAddress())) as TaskGame;
  await game.waitForDeployment();

  await coin.setMinter(await game.getAddress());

  return { coin, game };
}

describe("TaskGame", function () {
  let signers: Signers;
  let coin: ERC7984Coin;
  let game: TaskGame;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("Skipping TaskGame tests outside the mock fhEVM environment.");
      this.skip();
    }

    ({ coin, game } = await deployContracts());
  });

  it("allows a player to join only once and initializes mask", async function () {
    await expect(game.connect(signers.alice).joinGame()).to.emit(game, "PlayerJoined");

    const hasJoined = await game.hasJoined(signers.alice.address);
    expect(hasJoined).to.eq(true);

    const maskHandle = await game.getPlayerTaskMask(signers.alice.address);
    expect(maskHandle).to.not.eq(ethers.ZeroHash);

    const decryptedMask = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      maskHandle,
      await game.getAddress(),
      signers.alice,
    );
    expect(decryptedMask).to.eq(0n);

    await expect(game.connect(signers.alice).joinGame()).to.be.revertedWithCustomError(game, "AlreadyJoined");
  });

  it("mints reward exactly once per task", async function () {
    await game.connect(signers.alice).joinGame();

    const rewards = [100_000000n, 150_000000n];
    let expectedMask = 0n;
    let expectedBalance = 0n;

    for (let i = 0; i < rewards.length; i++) {
      const taskId = i + 1;
      const encryptedInput = await fhevm
        .createEncryptedInput(await game.getAddress(), signers.alice.address)
        .add64(taskId)
        .encrypt();

      await game
        .connect(signers.alice)
        .claimTask(encryptedInput.handles[0], encryptedInput.inputProof);

      const maskHandle = await game.getPlayerTaskMask(signers.alice.address);
      const maskValue = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        maskHandle,
        await game.getAddress(),
        signers.alice,
      );
      expectedMask |= 1n << BigInt(taskId - 1);
      expect(maskValue).to.eq(expectedMask);

      const balanceHandle = await coin.confidentialBalanceOf(signers.alice.address);
      const balanceValue = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balanceHandle,
        await coin.getAddress(),
        signers.alice,
      );
      expectedBalance += rewards[i];
      expect(balanceValue).to.eq(expectedBalance);
    }

    // Claim the first task again, balance should remain unchanged
    const encryptedDuplicate = await fhevm
      .createEncryptedInput(await game.getAddress(), signers.alice.address)
      .add64(1)
      .encrypt();

    await game
      .connect(signers.alice)
      .claimTask(encryptedDuplicate.handles[0], encryptedDuplicate.inputProof);

    const maskHandleAfterDuplicate = await game.getPlayerTaskMask(signers.alice.address);
    const maskValueAfterDuplicate = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      maskHandleAfterDuplicate,
      await game.getAddress(),
      signers.alice,
    );
    expect(maskValueAfterDuplicate).to.eq(expectedMask);

    const balanceHandleAfterDuplicate = await coin.confidentialBalanceOf(signers.alice.address);
    const balanceValueAfterDuplicate = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      balanceHandleAfterDuplicate,
      await coin.getAddress(),
      signers.alice,
    );

    expect(balanceValueAfterDuplicate).to.eq(expectedBalance);
  });
});
