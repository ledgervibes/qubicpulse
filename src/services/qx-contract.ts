import { QUBIC_QUERY_RPC_URL } from "../utils/constants";

interface AssetEvent {
  epoch: number;
  tickNumber: number;
  timestamp: string;
  transactionHash: string;
  logType: number;
  logId: string;
  assetIssuance?: {
    assetIssuer: string;
    numberOfShares: string;
    managingContractIndex: string;
    assetName: string;
    numberOfDecimalPlaces: number;
  };
  assetPossessionChange?: {
    source: string;
    destination: string;
    assetIssuer: string;
    assetName: string;
    numberOfShares: string;
  };
}

interface AssetInfo {
  name: string;
  issuer: string;
  totalSupply: number;
  holders: number;
}

async function queryEventLogs(
  filters: Record<string, string>,
  limit: number = 100
): Promise<AssetEvent[]> {
  const res = await fetch(`${QUBIC_QUERY_RPC_URL}/getEventLogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filters,
      pagination: { offset: 0, size: limit },
    }),
  });
  if (!res.ok) throw new Error(`Query RPC error: ${res.status}`);
  const data = await res.json();
  return data.eventLogs ?? [];
}

export async function getIssuedAssets(): Promise<AssetInfo[]> {
  const events = await queryEventLogs({ logType: "1", managingContractIndex: "1" }, 100);

  const assets: AssetInfo[] = [];
  const seen = new Set<string>();

  for (const event of events) {
    if (!event.assetIssuance) continue;
    const { assetName, assetIssuer, numberOfShares } = event.assetIssuance;
    if (!assetName || seen.has(assetName)) continue;
    seen.add(assetName);

    assets.push({
      name: assetName,
      issuer: assetIssuer,
      totalSupply: Number(numberOfShares),
      holders: 0,
    });
  }

  return assets;
}

export async function getRecentAssetTransfers(
  limit: number = 100
): Promise<AssetEvent[]> {
  return queryEventLogs({ logType: "3" }, limit);
}

export async function getAssetTransfersByName(
  assetName: string,
  limit: number = 100
): Promise<AssetEvent[]> {
  return queryEventLogs({ logType: "3", assetName }, limit);
}

export async function getAssetTransferStats(): Promise<
  Map<string, { transfers: number; volume: number }>
> {
  const events = await getRecentAssetTransfers(500);
  const stats = new Map<string, { transfers: number; volume: number }>();

  for (const event of events) {
    if (!event.assetPossessionChange) continue;
    const { assetName, numberOfShares } = event.assetPossessionChange;
    if (!assetName) continue;

    const existing = stats.get(assetName) || { transfers: 0, volume: 0 };
    existing.transfers += 1;
    existing.volume += Number(numberOfShares);
    stats.set(assetName, existing);
  }

  return stats;
}

export async function getTopAssets(): Promise<
  Array<{ name: string; transfers: number; volume: number }>
> {
  const stats = await getAssetTransferStats();

  return Array.from(stats.entries())
    .map(([name, { transfers, volume }]) => ({ name, transfers, volume }))
    .sort((a, b) => b.transfers - a.transfers)
    .slice(0, 20);
}
