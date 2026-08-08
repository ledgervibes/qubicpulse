import {
  querySmartContract,
  encodeUint32,
  encodeAddress,
  parseSint64,
  parseUint64,
} from "./qubic-rpc";
import type {
  QBondInfo,
  QBondFees,
  QBondMBondInfo,
  QBondUserMBonds,
} from "../types";

const QBOND_CONTRACT_INDEX = 17;

export async function getQBondInfo(epoch: number): Promise<QBondInfo> {
  const requestData = encodeUint32(epoch);

  return querySmartContract(
    QBOND_CONTRACT_INDEX,
    3,
    4,
    requestData,
    (data) => ({
      stakersAmount: parseUint64(data, 0),
      totalStaked: parseSint64(data, 8),
      apy: parseSint64(data, 16),
    })
  );
}

export async function getQBondFees(): Promise<QBondFees> {
  const requestData = new Uint8Array(0);

  return querySmartContract(
    QBOND_CONTRACT_INDEX,
    1,
    0,
    requestData,
    (data) => ({
      stakeFeePercent: parseUint64(data, 0),
      tradeFeePercent: parseUint64(data, 8),
      transferFee: parseSint64(data, 16),
    })
  );
}

export async function getQBondMBondsTable(): Promise<QBondMBondInfo[]> {
  const requestData = new Uint8Array(0);

  return querySmartContract(
    QBOND_CONTRACT_INDEX,
    6,
    0,
    requestData,
    (data) => {
      const info: QBondMBondInfo[] = [];
      const entrySize = 32;
      for (let i = 0; i < 512; i++) {
        const offset = i * entrySize;
        if (offset + entrySize > data.length) break;

        const epoch = parseUint64(data, offset);
        if (epoch === 0) break;

        info.push({
          epoch,
          totalStakedQBond: parseSint64(data, offset + 8),
          totalStakedQEarn: parseSint64(data, offset + 16),
          apy: parseSint64(data, offset + 24),
        });
      }
      return info;
    }
  );
}

export async function getQBondUserMBonds(
  ownerAddress: string
): Promise<QBondUserMBonds> {
  const requestData = encodeAddress(ownerAddress);

  return querySmartContract(
    QBOND_CONTRACT_INDEX,
    7,
    32,
    requestData,
    (data) => {
      const totalMBondsAmount = parseUint64(data, 0);
      const mbonds: Array<{ epoch: number; amount: number; apy: number }> = [];

      for (let i = 0; i < 256; i++) {
        const offset = 8 + i * 24;
        if (offset + 24 > data.length) break;

        const epoch = parseUint64(data, offset);
        if (epoch === 0) break;

        mbonds.push({
          epoch,
          amount: parseUint64(data, offset + 8),
          apy: parseSint64(data, offset + 16),
        });
      }

      return { totalMBondsAmount, mbonds };
    }
  );
}
