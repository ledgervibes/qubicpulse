import {
  querySmartContract,
  encodeUint32,
  encodeAddress,
  parseSint64,
} from "./qubic-rpc";
import type {
  QEarnLockInfo,
  QEarnStats,
  QEarnBurnedBoosted,
  QEarnUserStatus,
} from "../types";

const QEARN_CONTRACT_INDEX = 9;

export async function getQEarnLockInfo(epoch: number): Promise<QEarnLockInfo> {
  const requestData = encodeUint32(epoch);

  return querySmartContract(
    QEARN_CONTRACT_INDEX,
    1,
    4,
    requestData,
    (data) => ({
      lockedAmount: parseSint64(data, 0),
      bonusAmount: parseSint64(data, 8),
      currentLockedAmount: parseSint64(data, 16),
      currentBonusAmount: parseSint64(data, 24),
      yield: parseSint64(data, 32),
    })
  );
}

export async function getQEarnUserLockedInfo(
  userAddress: string,
  epoch: number
): Promise<{ lockedAmount: number }> {
  const requestData = new Uint8Array(36);
  requestData.set(encodeAddress(userAddress), 0);
  requestData.set(encodeUint32(epoch), 32);

  return querySmartContract(
    QEARN_CONTRACT_INDEX,
    2,
    36,
    requestData,
    (data) => ({
      lockedAmount: parseSint64(data, 0),
    })
  );
}

export async function getQEarnStats(epoch: number): Promise<QEarnStats> {
  const requestData = encodeUint32(epoch);

  return querySmartContract(
    QEARN_CONTRACT_INDEX,
    6,
    4,
    requestData,
    (data) => ({
      earlyUnlockedAmount: parseSint64(data, 0),
      earlyUnlockedPercent: parseSint64(data, 8),
      totalLockedAmount: parseSint64(data, 16),
      averageAPY: parseSint64(data, 24),
    })
  );
}

export async function getQEarnBurnedBoosted(): Promise<QEarnBurnedBoosted> {
  const requestData = new Uint8Array(0);

  return querySmartContract(
    QEARN_CONTRACT_INDEX,
    7,
    0,
    requestData,
    (data) => ({
      burnedAmount: parseSint64(data, 0),
      averageBurnedPercent: parseSint64(data, 8),
      boostedAmount: parseSint64(data, 16),
      averageBoostedPercent: parseSint64(data, 24),
      rewardedAmount: parseSint64(data, 32),
      averageRewardedPercent: parseSint64(data, 40),
    })
  );
}

export async function getQEarnEndedStatus(
  userAddress: string
): Promise<QEarnUserStatus> {
  const requestData = encodeAddress(userAddress);

  return querySmartContract(
    QEARN_CONTRACT_INDEX,
    5,
    32,
    requestData,
    (data) => ({
      fullyUnlockedAmount: parseSint64(data, 0),
      fullyRewardedAmount: parseSint64(data, 8),
      earlyUnlockedAmount: parseSint64(data, 16),
      earlyRewardedAmount: parseSint64(data, 24),
    })
  );
}
