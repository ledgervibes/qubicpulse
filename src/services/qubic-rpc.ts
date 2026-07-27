import { QUBIC_RPC_URL, QUBIC_QUERY_RPC_URL } from "../utils/constants";
import type { TickInfo, WalletBalance, Transaction } from "../types";

async function fetchRPC<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${QUBIC_RPC_URL}${endpoint}`);
  if (!res.ok) throw new Error(`RPC error: ${res.status}`);
  return res.json();
}

async function postQueryRPC<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${QUBIC_QUERY_RPC_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Query RPC error: ${res.status}`);
  return res.json();
}

export async function getTickInfo(): Promise<TickInfo> {
  const data = await fetchRPC<{ tickInfo: { tick: number; timestamp: number } }>(
    "/v1/tick-info"
  );
  return data.tickInfo;
}

export async function getBalance(publicId: string): Promise<WalletBalance> {
  const data = await fetchRPC<{
    balance: {
      balance: number;
      incomingAmount: number;
      outgoingAmount: number;
      numberOfTransfers: number;
      latestIncomingTransferTick: number;
    };
  }>(`/v1/balances/${publicId}`);

  const b = data.balance;
  return {
    address: publicId,
    balance: Number(b.balance),
    incomingAmount: Number(b.incomingAmount),
    outgoingAmount: Number(b.outgoingAmount),
    numberOfTransfers: Number(b.numberOfTransfers),
    lastActivityTick: Number(b.latestIncomingTransferTick),
  };
}

export async function getStatus(): Promise<{
  currentTick: number;
  epoch: number;
}> {
  const data = await fetchRPC<{
    lastProcessedTick: { tickNumber: number; epoch: number };
  }>("/v1/status");
  return {
    currentTick: data.lastProcessedTick.tickNumber,
    epoch: data.lastProcessedTick.epoch,
  };
}

export async function getTransactions(
  identity: string,
  limit: number = 20,
  offset: number = 0
): Promise<Transaction[]> {
  const data = await postQueryRPC<{
    transactions: Transaction[];
  }>("/getTransactionsForIdentity", {
    identity: identity.toUpperCase(),
    pagination: {
      offset,
      size: limit,
    },
  });

  return data.transactions ?? [];
}

export interface EventLog {
  epoch: number;
  tickNumber: number;
  timestamp: string;
  transactionHash: string;
  logType: number;
  logId: string;
  quTransfer?: {
    source: string;
    destination: string;
    amount: string;
  };
  assetPossessionChange?: {
    source: string;
    destination: string;
    assetIssuer: string;
    assetName: string;
    numberOfShares: string;
  };
  assetOwnershipChange?: {
    source: string;
    destination: string;
    assetIssuer: string;
    assetName: string;
    numberOfShares: string;
  };
}

export async function getEventLogs(
  filters: Record<string, string>,
  limit: number = 50,
  offset: number = 0
): Promise<EventLog[]> {
  const data = await postQueryRPC<{
    eventLogs: EventLog[];
  }>("/getEventLogs", {
    filters,
    pagination: {
      offset,
      size: limit,
    },
  });

  return data.eventLogs ?? [];
}

export async function getAssetHoldings(address: string): Promise<Array<{
  assetName: string;
  assetIssuer: string;
  balance: number;
}>> {
  const incoming = await getEventLogs(
    { destination: address.toUpperCase(), logType: "3" },
    100
  );
  const outgoing = await getEventLogs(
    { source: address.toUpperCase(), logType: "3" },
    100
  );

  const holdings = new Map<string, { assetIssuer: string; balance: number }>();

  for (const log of incoming) {
    if (!log.assetPossessionChange) continue;
    const { assetName, assetIssuer, numberOfShares } = log.assetPossessionChange;
    const existing = holdings.get(assetName) || { assetIssuer, balance: 0 };
    existing.balance += Number(numberOfShares);
    holdings.set(assetName, existing);
  }

  for (const log of outgoing) {
    if (!log.assetPossessionChange) continue;
    const { assetName, numberOfShares } = log.assetPossessionChange;
    const existing = holdings.get(assetName);
    if (existing) {
      existing.balance -= Number(numberOfShares);
    }
  }

  return Array.from(holdings.entries())
    .map(([assetName, { assetIssuer, balance }]) => ({
      assetName,
      assetIssuer,
      balance,
    }))
    .filter((h) => h.balance > 0);
}
