import { getEventLogs } from "./qubic-rpc";
import type { EventLog } from "./qubic-rpc";
import { QUBIC_LIVE_RPC_URL } from "../utils/constants";

export interface QubicAsset {
  name: string;
  issuer: string;
  totalSupply: number | null;
  decimals: number;
  universeIndex: number;
}

export interface AssetWithActivity extends QubicAsset {
  recentTransfers: number;
  volume: number;
}

const TRANSFER_LOG_TYPE = "3";

interface LiveIssuanceItem {
  data: {
    issuerIdentity: string;
    type: number;
    name: string;
    numberOfDecimalPlaces: number;
    unitOfMeasurement: number[];
  };
  tick: number;
  universeIndex: number;
}

interface LiveOwnershipItem {
  data: {
    ownerIdentity: string;
    type: number;
    numberOfUnits: string;
  };
  tick: number;
  universeIndex: number;
}

function sharesNumber(value: string | undefined): number {
  const n = Number(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

async function fetchLiveIssuances(): Promise<LiveIssuanceItem[]> {
  const res = await fetch(`${QUBIC_LIVE_RPC_URL}/assets/issuances`);
  if (!res.ok) throw new Error(`Live API error: ${res.status}`);
  const data = await res.json();
  return data?.assets ?? [];
}

function fromLiveItem(item: LiveIssuanceItem): QubicAsset {
  return {
    name: item.data.name,
    issuer: item.data.issuerIdentity,
    totalSupply: null,
    decimals: item.data.numberOfDecimalPlaces ?? 0,
    universeIndex: item.universeIndex,
  };
}

export async function getAllIssuedAssets(): Promise<QubicAsset[]> {
  const items = await fetchLiveIssuances();
  const assets = items.map(fromLiveItem);

  return assets.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAssetByName(
  assetName: string
): Promise<QubicAsset | null> {
  const items = await fetchLiveIssuances();
  const found = items.find(
    (item) =>
      item.data.name.toUpperCase() === assetName.trim().toUpperCase()
  );
  return found ? fromLiveItem(found) : null;
}

export async function getAssetTotalSupply(
  assetName: string,
  issuer: string
): Promise<number | null> {
  const url = new URL(`${QUBIC_LIVE_RPC_URL}/assets/ownerships`);
  url.searchParams.set("issuerIdentity", issuer);
  url.searchParams.set("assetName", assetName);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Live API error: ${res.status}`);
  const data = await res.json();
  const items: LiveOwnershipItem[] = data?.assets ?? [];

  let total = 0;
  for (const item of items) {
    const units = Number(item.data.numberOfUnits);
    if (Number.isFinite(units) && units > 0) total += units;
  }
  return total > 0 ? total : null;
}

export async function getAssetRecentTransfers(
  assetName: string,
  limit: number = 50
): Promise<EventLog[]> {
  return getEventLogs({ logType: TRANSFER_LOG_TYPE, assetName }, limit, 0);
}

export async function getRecentlyIssuedAssets(
  limit: number = 20
): Promise<QubicAsset[]> {
  const items = await fetchLiveIssuances();
  const assets = items.map(fromLiveItem);

  return assets
    .slice()
    .sort((a, b) => b.universeIndex - a.universeIndex)
    .slice(0, limit);
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