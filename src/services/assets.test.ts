import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAllIssuedAssets,
  getAssetRecentTransfers,
  getAssetListWithActivity,
} from "./assets";

function issuanceEvent(
  overrides: Partial<{
    assetName: string;
    assetIssuer: string;
    numberOfShares: string;
    numberOfDecimalPlaces: number;
    tickNumber: number;
    timestamp: string;
    logId: string;
  }>
) {
  return {
    epoch: 1,
    tickNumber: overrides.tickNumber ?? 1000,
    timestamp: overrides.timestamp ?? "2026-01-01T00:00:00.000Z",
    transactionHash: "TX",
    logType: 1,
    logId: overrides.logId ?? "log-1",
    assetIssuance: {
      assetIssuer: overrides.assetIssuer ?? "ISSUERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      numberOfShares: overrides.numberOfShares ?? "1000",
      managingContractIndex: "1",
      assetName: overrides.assetName ?? "TEST",
      numberOfDecimalPlaces: overrides.numberOfDecimalPlaces ?? 0,
    },
  };
}

function transferEvent(
  assetName: string,
  shares: string,
  logId: string,
  other?: Partial<Record<"source" | "destination", string>>
) {
  return {
    epoch: 1,
    tickNumber: 1050,
    timestamp: "2026-01-02T00:00:00.000Z",
    transactionHash: "TX",
    logType: 3,
    logId,
    assetPossessionChange: {
      source: other?.source ?? "SENDERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      destination: other?.destination ?? "RECEIVERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      assetIssuer: "ISSUERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      assetName,
      numberOfShares: shares,
    },
  };
}

function stubFetch(pages: Array<Record<string, unknown>[]>) {
  let call = 0;
  const mock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    const filterLog = body.filters?.logType;
    const isTransfer = filterLog === "3";
    const limit = body.pagination?.size ?? 100;
    const page = pages[call++ % pages.length] ?? [];
    if (filterLog === "1" && !isTransfer) {
      const filters = body.filters;
      if (filters.assetName) {
        return {
          ok: true,
          json: async () => ({
            eventLogs: page.filter(
              (e: any) => e.assetIssuance?.assetName === filters.assetName
            ),
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ eventLogs: page.slice(0, limit) }),
      };
    }
    return {
      ok: true,
      json: async () => ({ eventLogs: page.slice(0, limit) }),
    };
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("assets service", () => {
  describe("getAllIssuedAssets", () => {
    it("returns deduplicated assets sorted by name", async () => {
      const page1 = [
        issuanceEvent({ assetName: "ALPHA", numberOfShares: "1000" }),
        issuanceEvent({ assetName: "BETA", numberOfShares: "2000", tickNumber: 900 }),
        issuanceEvent({ assetName: "ALPHA", numberOfShares: "9999", logId: "dup" }),
      ];
      stubFetch([page1]);

      const assets = await getAllIssuedAssets();

      expect(assets).toHaveLength(2);
      expect(assets[0].name).toBe("ALPHA");
      expect(assets[0].totalSupply).toBe(1000);
      expect(assets[0].firstSeenTick).toBe(1000);
      expect(assets[1].name).toBe("BETA");
      expect(assets[1].totalSupply).toBe(2000);
    });

    it("stops paginating after an empty page", async () => {
      const fullPage = Array.from({ length: 100 }, (_, i) =>
        issuanceEvent({ assetName: `A${String(i).padStart(3, "0")}`, logId: `l${i}` })
      );
      const fetchMock = stubFetch([fullPage, []]);

      const assets = await getAllIssuedAssets();

      expect(assets).toHaveLength(100);
      expect(fetchMock.mock.calls.length).toBe(2);
    });
  });

  describe("getAssetRecentTransfers", () => {
    it("returns possession change events for the asset", async () => {
      stubFetch([[transferEvent("ABC", "50", "t1")]]);

      const events = await getAssetRecentTransfers("ABC");

      expect(events).toHaveLength(1);
      expect(events[0].assetPossessionChange?.assetName).toBe("ABC");
      expect(events[0].assetPossessionChange?.numberOfShares).toBe("50");
    });
  });

  describe("getAssetListWithActivity", () => {
    it("counts recent transfers and volume per asset", async () => {
      stubFetch([
        [
          issuanceEvent({ assetName: "AAA", tickNumber: 800 }),
          issuanceEvent({ assetName: "BBB", tickNumber: 900 }),
        ],
        [
          transferEvent("AAA", "10", "t1"),
          transferEvent("AAA", "15", "t2"),
          transferEvent("BBB", "5", "t3"),
        ],
      ]);

      const assets = await getAssetListWithActivity();

      const aaa = assets.find((a) => a.name === "AAA");
      const bbb = assets.find((a) => a.name === "BBB");

      expect(aaa?.recentTransfers).toBe(2);
      expect(aaa?.volume).toBe(25);
      expect(bbb?.recentTransfers).toBe(1);
      expect(bbb?.volume).toBe(5);
    });
  });
});