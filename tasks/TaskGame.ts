import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:game-address", "Prints the deployed TaskGame and ERC7984Coin addresses").setAction(
  async (_args: TaskArguments, hre) => {
    const { deployments } = hre;

    const game = await deployments.get("TaskGame");
    const coin = await deployments.get("ERC7984Coin");

    console.log(`TaskGame address: ${game.address}`);
    console.log(`COIN address    : ${coin.address}`);
  },
);

task("task:join-game", "Joins the encrypted quest for the connected account")
  .addOptionalParam("address", "Optionally specify a TaskGame contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { deployments, ethers } = hre;

    const deployment = args.address ? { address: args.address as string } : await deployments.get("TaskGame");

    const [signer] = await ethers.getSigners();
    const taskGame = await ethers.getContractAt("TaskGame", deployment.address);

    const tx = await taskGame.connect(signer).joinGame();
    console.log(`Joining game with tx: ${tx.hash}`);
    await tx.wait();
    console.log("Successfully joined the encrypted quest.");
  });

task("task:claim-task", "Claims a task reward using encrypted task identifier")
  .addParam("task", "Task identifier between 1 and 5")
  .addOptionalParam("address", "Optionally specify a TaskGame contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { deployments, ethers, fhevm } = hre;

    const taskNumber = parseInt(args.task as string, 10);
    if (Number.isNaN(taskNumber) || taskNumber < 1 || taskNumber > 5) {
      throw new Error("Task identifier must be between 1 and 5");
    }

    await fhevm.initializeCLIApi();

    const deployment = args.address ? { address: args.address as string } : await deployments.get("TaskGame");

    const [signer] = await ethers.getSigners();
    const taskGame = await ethers.getContractAt("TaskGame", deployment.address);

    const encryptedInput = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add64(taskNumber)
      .encrypt();

    const tx = await taskGame
      .connect(signer)
      .claimTask(encryptedInput.handles[0], encryptedInput.inputProof);

    console.log(`Claim transaction: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Status: ${receipt?.status === 1 ? "success" : "failed"}`);
  });

task("task:decrypt-mask", "Decrypts the caller's task completion mask")
  .addOptionalParam("address", "Optionally specify a TaskGame contract address")
  .setAction(async (args: TaskArguments, hre) => {
    const { deployments, ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = args.address ? { address: args.address as string } : await deployments.get("TaskGame");

    const [signer] = await ethers.getSigners();
    const taskGame = await ethers.getContractAt("TaskGame", deployment.address);

    const maskHandle = await taskGame.getPlayerTaskMask(signer.address);

    if (maskHandle === ethers.ZeroHash) {
      console.log("No encrypted mask found. Join the game first.");
      return;
    }

    const decryptedMask = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      maskHandle,
      deployment.address,
      signer,
    );

    const maskValue = BigInt(decryptedMask.toString());
    console.log(`Decrypted mask value: ${maskValue}`);
    for (let i = 0; i < 5; i++) {
      const claimed = (maskValue & (1n << BigInt(i))) !== 0n;
      console.log(`Task ${i + 1}: ${claimed ? "completed" : "pending"}`);
    }
  });
