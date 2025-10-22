import { useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatUnits, type Address } from 'viem';
import { Contract } from 'ethers';

import { Header } from './Header';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import {
  TASK_GAME_ADDRESS,
  TASK_GAME_ABI,
  COIN_ADDRESS,
  COIN_ABI,
  COIN_DECIMALS,
} from '../config/contracts';

import '../styles/GameApp.css';
import '../styles/TaskCard.css';
import '../styles/PlayerPanel.css';

type TaskDetail = {
  id: number;
  name: string;
  description: string;
  reward: bigint;
};

const TOKEN_DECIMALS = COIN_DECIMALS;
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

const isValidAddress = (value: string | undefined): value is `0x${string}` =>
  Boolean(value && value.startsWith('0x') && value.length === 42);

export function GameApp() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: zamaLoading, error: zamaError } = useZamaInstance();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [processingTaskId, setProcessingTaskId] = useState<number | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedMask, setDecryptedMask] = useState<bigint | null>(null);
  const [decryptedBalance, setDecryptedBalance] = useState<bigint | null>(null);

  const taskGameAddress: Address = TASK_GAME_ADDRESS;
  const coinAddress: Address = COIN_ADDRESS;

  const configurationReady =
    isValidAddress(TASK_GAME_ADDRESS) && isValidAddress(COIN_ADDRESS) && Boolean(publicClient);

  const tasksQuery = useQuery({
    queryKey: ['task-game', 'tasks'],
    enabled: configurationReady,
    queryFn: async (): Promise<TaskDetail[]> => {
      const raw = await publicClient!.readContract({
        address: taskGameAddress,
        abi: TASK_GAME_ABI,
        functionName: 'getTasks',
      } as any);

      const list = raw as Array<any>;

      return list.map((entry, index) => ({
        id: index + 1,
        name: entry.name ?? entry[0] ?? '',
        description: entry.description ?? entry[1] ?? '',
        reward: BigInt(entry.reward ?? entry[2] ?? 0n),
      }));
    },
  });

  const hasJoinedQuery = useQuery({
    queryKey: ['task-game', 'joined', address],
    enabled: configurationReady && Boolean(address),
    queryFn: async () => {
      return (await publicClient!.readContract({
        address: taskGameAddress,
        abi: TASK_GAME_ABI,
        functionName: 'hasJoined',
        args: [address],
      } as any)) as boolean;
    },
  });

  const maskHandleQuery = useQuery({
    queryKey: ['task-game', 'mask', address],
    enabled: configurationReady && Boolean(address) && hasJoinedQuery.data === true,
    queryFn: async () => {
      return (await publicClient!.readContract({
        address: taskGameAddress,
        abi: TASK_GAME_ABI,
        functionName: 'getPlayerTaskMask',
        args: [address],
      } as any)) as `0x${string}`;
    },
  });

  const balanceHandleQuery = useQuery({
    queryKey: ['task-game', 'balance-handle', address],
    enabled: configurationReady && Boolean(address) && hasJoinedQuery.data === true,
    queryFn: async () => {
      return (await publicClient!.readContract({
        address: coinAddress,
        abi: COIN_ABI,
        functionName: 'confidentialBalanceOf',
        args: [address],
      } as any)) as `0x${string}`;
    },
  });

  const claimedTasks = useMemo(() => {
    if (decryptedMask === null) {
      return new Set<number>();
    }

    const set = new Set<number>();
    for (let i = 0; i < 64; i++) {
      const mask = 1n << BigInt(i);
      if ((decryptedMask & mask) !== 0n) {
        set.add(i + 1);
      }
    }
    return set;
  }, [decryptedMask]);

  useEffect(() => {
    setFeedback(null);
  }, [address]);

  useEffect(() => {
    if (!hasJoinedQuery.data) {
      setDecryptedMask(null);
      setDecryptedBalance(null);
    }
  }, [hasJoinedQuery.data]);

  const formatReward = (value: bigint) => formatUnits(value, TOKEN_DECIMALS);

  const joinGame = async () => {
    if (!configurationReady) {
      setFeedback('Contract configuration missing.');
      return;
    }
    if (!isConnected) {
      setFeedback('Connect your wallet to join the quest.');
      return;
    }
    if (!signerPromise) {
      setFeedback('Wallet signer is not ready.');
      return;
    }

    try {
      setJoining(true);
      const signer = await signerPromise;
      const gameContract = new Contract(taskGameAddress, TASK_GAME_ABI, signer);
      const tx = await gameContract.joinGame();
      setFeedback('Joining the encrypted quest...');
      await tx.wait();
      setFeedback('Welcome to the quest board!');
      await queryClient.invalidateQueries({ queryKey: ['task-game', 'joined', address] });
      await queryClient.invalidateQueries({ queryKey: ['task-game', 'mask', address] });
      await queryClient.invalidateQueries({ queryKey: ['task-game', 'balance-handle', address] });
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : 'Failed to join the quest.');
    } finally {
      setJoining(false);
    }
  };

  const claimTask = async (taskId: number) => {
    if (!configurationReady) {
      setFeedback('Contract configuration missing.');
      return;
    }
    if (!isConnected || !address) {
      setFeedback('Connect your wallet to claim rewards.');
      return;
    }
    if (!hasJoinedQuery.data) {
      setFeedback('Join the quest before claiming tasks.');
      return;
    }
    if (!signerPromise) {
      setFeedback('Wallet signer is not ready.');
      return;
    }
    if (!instance) {
      setFeedback('Encryption service is not ready yet.');
      return;
    }

    try {
      setProcessingTaskId(taskId);
      setFeedback('Encrypting your task identifier...');

      const signer = await signerPromise;

      const encryptedInput = await instance
        .createEncryptedInput(taskGameAddress, address)
        .add64(taskId)
        .encrypt();

      const gameContract = new Contract(taskGameAddress, TASK_GAME_ABI, signer);
      const tx = await gameContract.claimTask(encryptedInput.handles[0], encryptedInput.inputProof);

      setFeedback('Submitting encrypted claim...');
      await tx.wait();
      setFeedback('Task processed. Decrypt to view latest rewards.');

      await queryClient.invalidateQueries({ queryKey: ['task-game', 'mask', address] });
      await queryClient.invalidateQueries({ queryKey: ['task-game', 'balance-handle', address] });
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : 'Failed to claim task.');
    } finally {
      setProcessingTaskId(null);
    }
  };

  const decryptProgress = async () => {
    if (!configurationReady) {
      setFeedback('Contract configuration missing.');
      return;
    }
    if (!instance) {
      setFeedback('Encryption service is still starting.');
      return;
    }
    if (!address || !isConnected) {
      setFeedback('Connect your wallet to decrypt progress.');
      return;
    }
    if (!signerPromise) {
      setFeedback('Wallet signer is not ready.');
      return;
    }

    const maskHandle = maskHandleQuery.data;
    const balanceHandle = balanceHandleQuery.data;

    if (!maskHandle || maskHandle === ZERO_HASH) {
      setFeedback('No encrypted progress found. Complete a task first.');
      return;
    }

    try {
      setDecrypting(true);
      const keypair = instance.generateKeypair();

      const handleContractPairs = [
        { handle: maskHandle, contractAddress: taskGameAddress },
      ];

      if (balanceHandle && balanceHandle !== ZERO_HASH) {
        handleContractPairs.push({ handle: balanceHandle, contractAddress: coinAddress });
      }

      const contractAddresses = Array.from(
        new Set(handleContractPairs.map((entry) => entry.contractAddress)),
      );

      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      );

      const signer = await signerPromise;

      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimestamp,
        durationDays,
      );

      const decryptedMaskValue = result[maskHandle] ?? '0';
      setDecryptedMask(BigInt(decryptedMaskValue));

      if (balanceHandle && result[balanceHandle]) {
        setDecryptedBalance(BigInt(result[balanceHandle]));
      }

      setFeedback('Decryption complete. Progress updated.');
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : 'Failed to decrypt progress.');
    } finally {
      setDecrypting(false);
    }
  };

  const renderStatus = (taskId: number) => {
    if (decryptedMask === null) {
      return 'Encrypted';
    }
    return claimedTasks.has(taskId) ? 'Completed' : 'Available';
  };

  const renderBalance = () => {
    if (!hasJoinedQuery.data) {
      return 'Join to start earning.';
    }
    if (decryptedBalance === null) {
      return 'Balance encrypted. Decrypt to reveal rewards.';
    }
    return `${formatReward(decryptedBalance)} COIN`;
  };

  return (
    <div className="game-app">
      <Header />

      <main className="game-content">
        <section className="player-panel">
          <h2 className="panel-title">Adventurer Console</h2>
          <p className="panel-subtitle">
            Step into the concealed arena, unlock encrypted quests, and earn COIN for every successful claim.
          </p>

          {!configurationReady && (
            <div className="panel-alert">Contract addresses are not configured.</div>
          )}

          {zamaError && <div className="panel-alert">{zamaError}</div>}

          <div className="panel-actions">
            <button
              className="primary-button"
              onClick={joinGame}
              disabled={joining || !configurationReady || zamaLoading}
            >
              {joining ? 'Joining...' : 'Join the Quest'}
            </button>

            <button
              className="secondary-button"
              onClick={decryptProgress}
              disabled={decrypting || !configurationReady || !hasJoinedQuery.data}
            >
              {decrypting ? 'Decrypting...' : 'Decrypt Progress'}
            </button>
          </div>

          <div className="panel-status-grid">
            <div>
              <span className="status-label">Connection</span>
              <p className="status-value">{isConnected ? 'Wallet connected' : 'Wallet disconnected'}</p>
            </div>
            <div>
              <span className="status-label">Quest Status</span>
              <p className="status-value">
                {hasJoinedQuery.data ? 'Enlisted adventurer' : 'Awaiting enlistment'}
              </p>
            </div>
            <div>
              <span className="status-label">COIN Balance</span>
              <p className="status-value">{renderBalance()}</p>
            </div>
          </div>

          {feedback && <div className="panel-feedback">{feedback}</div>}
        </section>

        <section className="task-section">
          <div className="task-section-header">
            <h2 className="section-title">Quest Log</h2>
            <span className="section-caption">Five encrypted objectives guard the COIN vault.</span>
          </div>

          <div className="task-grid">
            {tasksQuery.isLoading && <div className="task-placeholder">Loading tasks...</div>}
            {tasksQuery.isError && <div className="task-placeholder">Failed to load tasks.</div>}
            {tasksQuery.data?.map((task) => (
              <article className="task-card" key={task.id}>
                <div>
                  <div className="task-header">
                    <span className="task-id">#{task.id}</span>
                    <span className={`task-status ${renderStatus(task.id).toLowerCase()}`}>
                      {renderStatus(task.id)}
                    </span>
                  </div>
                  <h3 className="task-title">{task.name}</h3>
                  <p className="task-description">{task.description}</p>
                </div>
                <div className="task-footer">
                  <div>
                    <span className="task-reward-label">Reward</span>
                    <p className="task-reward-value">{formatReward(task.reward)} COIN</p>
                  </div>
                  <button
                    className="claim-button"
                    onClick={() => claimTask(task.id)}
                    disabled={
                      processingTaskId === task.id ||
                      !hasJoinedQuery.data ||
                      zamaLoading ||
                      !configurationReady
                    }
                  >
                    {processingTaskId === task.id ? 'Submitting...' : 'Claim Task'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
