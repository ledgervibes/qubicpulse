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
    balance: b.balance,
    incomingAmount: b.incomingAmount,
    outgoingAmount: b.outgoingAmount,
    numberOfTransfers: b.numberOfTransfers,
    lastActivityTick: b.latestIncomingTransferTick,
  };
}

export async function getStatus(): Promise<{
  currentTick: number;
  epoch: number;
}> {
  const data = await fetchRPC<{
    status: { currentTick: number; epoch: number };
  }>("/v1/status");
  return data.status;
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
