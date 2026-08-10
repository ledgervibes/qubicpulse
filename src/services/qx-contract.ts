import { getEventLogs } from "./qubic-rpc";

const TRANSFER_LOG_TYPE = "3";

interface AssetInfo {
  name: string;
  issuer: string;
  totalSupply: number;
  holders: number;
}

export async function getIssuedAssets(): Promise<AssetInfo[]> {
  const events = await getEventLogs(
    { logType: "1", managingContractIndex: "1" },
    100,
    0
  );

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
) {
  return getEventLogs({ logType: TRANSFER_LOG_TYPE }, limit, 0);
}

export async function getAssetTransfersByName(
  assetName: string,
  limit: number = 100
) {
  return getEventLogs({ logType: TRANSFER_LOG_TYPE, assetName }, limit, 0);
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