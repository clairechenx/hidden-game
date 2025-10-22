import * as dotenv from "dotenv";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

dotenv.config();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, execute } = hre.deployments;

  const infuraKey = process.env.INFURA_API_KEY;
  if (!infuraKey) {
    console.warn("INFURA_API_KEY is not set in environment variables.");
  }

  const coinDeployment = await deploy("ERC7984Coin", {
    from: deployer,
    log: true,
  });

  const gameDeployment = await deploy("TaskGame", {
    from: deployer,
    args: [coinDeployment.address],
    log: true,
  });

  await execute(
    "ERC7984Coin",
    { from: deployer, log: true },
    "setMinter",
    gameDeployment.address,
  );

  console.log(`TaskGame deployed at ${gameDeployment.address}`);
  console.log(`ERC7984Coin deployed at ${coinDeployment.address}`);
};

export default func;
func.id = "deploy_task_game";
func.tags = ["TaskGame", "ERC7984Coin"];
