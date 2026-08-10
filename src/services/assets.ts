import { getEventLogs } from "./qubic-rpc";
import type { EventLog } from "./qubic-rpc";

export interface QubicAsset {
  name: string;
  issuer: string;
  totalSupply: number;
  decimals: number;
  firstSeenTick: number;
  firstSeenTimestamp: string;
  transferCount: number;
  source: "rpc";
}

export interface AssetWithActivity extends QubicAsset {
  recentTransfers: number;
  volume: number;
}

const ISSUANCE_LOG_TYPE = "1";
const TRANSFER_LOG_TYPE = "3";
const QX_MANAGING_CONTRACT = "1";

const batchSize = 100;

function sharesNumber(value: string | undefined): number {
  const n = Number(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

function toAsset(event: EventLog): QubicAsset | null {
  const issuance = event.assetIssuance;
  if (!issuance?.assetName) return null;
  return {
    name: issuance.assetName,
    issuer: issuance.assetIssuer,
    totalSupply: sharesNumber(issuance.numberOfShares),
    decimals: issuance.numberOfDecimalPlaces ?? 0,
    firstSeenTick: event.tickNumber,
    firstSeenTimestamp: event.timestamp,
    transferCount: 0,
    source: "rpc",
  };
}

export async function getAllIssuedAssets(
  maxAssets: number = 2000
): Promise<QubicAsset[]> {
  const filters = {
    logType: ISSUANCE_LOG_TYPE,
    managingContractIndex: QX_MANAGING_CONTRACT,
  };
  const assetsMap = new Map<string, QubicAsset>();

  for (let offset = 0; offset < maxAssets; offset += batchSize) {
    const events = await getEventLogs(filters, batchSize, offset);
    if (events.length === 0) break;

    for (const event of events) {
      const asset = toAsset(event);
      if (asset && !assetsMap.has(asset.name)) {
        assetsMap.set(asset.name, asset);
      }
    }

    if (events.length < batchSize) break;
  }

  return Array.from(assetsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function getAssetByName(
  assetName: string
): Promise<QubicAsset | null> {
  const events = await getEventLogs(
    {
      logType: ISSUANCE_LOG_TYPE,
      managingContractIndex: QX_MANAGING_CONTRACT,
      assetName,
    },
    1,
    0
  );

  return events[0] ? toAsset(events[0]) : null;
}

export async function getAssetRecentTransfers(
  assetName: string,
  limit: number = 50
): Promise<EventLog[]> {
  return getEventLogs({ logType: TRANSFER_LOG_TYPE, assetName }, limit, 0);
}

export async function getAssetTransfersByIssuer(
  issuer: string,
  limit: number = 100
): Promise<EventLog[]> {
  return getEventLogs({ logType: TRANSFER_LOG_TYPE, assetIssuer: issuer }, limit, 0);
}

export async function getRecentlyIssuedAssets(
  limit: number = 20
): Promise<QubicAsset[]> {
  const events = await getEventLogs(
    {
      logType: ISSUANCE_LOG_TYPE,
      managingContractIndex: QX_MANAGING_CONTRACT,
    },
    limit,
    0
  );

  const seen = new Set<string>();
  const assets: QubicAsset[] = [];

  for (const event of events) {
    const asset = toAsset(event);
    if (asset && !seen.has(asset.name)) {
      seen.add(asset.name);
      assets.push(asset);
    }
  }

  return assets;
}

export async function getAssetListWithActivity(
  sampleSize: number = 500
): Promise<AssetWithActivity[]> {
  const [assets, transfers] = await Promise.all([
    getAllIssuedAssets(),
    getEventLogs({ logType: TRANSFER_LOG_TYPE }, sampleSize, 0),
  ]);

  const activityMap = new Map<
    string,
    { recentTransfers: number; volume: number }
  >();

  for (const event of transfers) {
    const name = event.assetPossessionChange?.assetName;
    if (!name) continue;
    const existing = activityMap.get(name) ?? { recentTransfers: 0, volume: 0 };
    existing.recentTransfers += 1;
    existing.volume += sharesNumber(
      event.assetPossessionChange?.numberOfShares
    );
    activityMap.set(name, existing);
  }

  return assets.map((asset) => ({
    ...asset,
    recentTransfers: activityMap.get(asset.name)?.recentTransfers ?? 0,
    volume: activityMap.get(asset.name)?.volume ?? 0,
  }));
}