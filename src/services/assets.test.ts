import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAllIssuedAssets,
  getAssetRecentTransfers,
  getAssetListWithActivity,
  getAssetTotalSupply,
} from "./assets";

const LIVING_ISSUER = "ISSUERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function liveIssuance(
  name: string,
  universeIndex: number,
  overrides: Partial<{
    issuer: string;
    decimals: number;
    tick: number;
  }> = {}
) {
  return {
    data: {
      issuerIdentity: overrides.issuer ?? LIVING_ISSUER,
      type: 1,
      name,
      numberOfDecimalPlaces: overrides.decimals ?? 0,
      unitOfMeasurement: [],
    },
    tick: overrides.tick ?? 1000,
    universeIndex,
  };
}

function liveOwnership(
  owner: string,
  numberOfUnits: string,
  overrides: Partial<{ type: number; tick: number; universeIndex: number }> = {}
) {
  return {
    data: { ownerIdentity: owner, type: overrides.type ?? 1, numberOfUnits },
    tick: overrides.tick ?? 1000,
    universeIndex: overrides.universeIndex ?? 0,
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
      assetIssuer: LIVING_ISSUER,
      assetName,
      numberOfShares: shares,
    },
  };
}

function stubFetch(opts: {
  liveIssuances?: unknown[];
  liveOwnerships?: unknown[];
  queryPages?: Array<Record<string, unknown>[]>;
}) {
  const calls: string[] = [];
  const mock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push(url);

      if (url.includes("/live/v1")) {
        if (url.includes("assets/ownerships")) {
          return {
            ok: true,
            json: async () => ({ assets: opts.liveOwnerships ?? [] }),
          };
        }
        if (url.includes("assets/issuances")) {
          return {
            ok: true,
            json: async () => ({ assets: opts.liveIssuances ?? [] }),
          };
        }
        throw new Error(`Unexpected live URL: ${url}`);
      }

      const pages = opts.queryPages ?? [];
      let call = 0;
      for (const u of calls) {
        if (!u.includes("/live/v1")) call += 1;
      }
      const index = Math.max(0, call - 1);
      const page = pages[index % pages.length] ?? [];

      const body = init?.body ? JSON.parse(String(init.body)) : {};
      const limit = body.pagination?.size ?? 100;
      return {
        ok: true,
        json: async () => ({ eventLogs: page.slice(0, limit) }),
      };
    }
  );
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
    it("returns live assets sorted by name", async () => {
      stubFetch({
        liveIssuances: [liveIssuance("ZETA", 7), liveIssuance("ALPHA", 5)],
      });

      const assets = await getAllIssuedAssets();

      expect(assets).toHaveLength(2);
      expect(assets[0].name).toBe("ALPHA");
      expect(assets[1].name).toBe("ZETA");
      expect(assets[0].decimals).toBe(0);
      expect(assets[0].universeIndex).toBe(5);
    });
  });

  describe("getAssetTotalSupply", () => {
    it("sums positive ownership shares", async () => {
      stubFetch({
        liveOwnerships: [
          liveOwnership("OWNER1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "10"),
          liveOwnership("OWNER2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "15"),
          liveOwnership("BURNEDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "0"),
        ],
      });

      const supply = await getAssetTotalSupply("ALPHA", LIVING_ISSUER);

      expect(supply).toBe(25);
    });

    it("returns null when no positive ownership exists", async () => {
      stubFetch({ liveOwnerships: [] });

      const supply = await getAssetTotalSupply("ALPHA", LIVING_ISSUER);

      expect(supply).toBeNull();
    });
  });

  describe("getAssetRecentTransfers", () => {
    it("returns possession change events for the asset", async () => {
      stubFetch({
        queryPages: [[transferEvent("ABC", "50", "t1")]],
      });

      const events = await getAssetRecentTransfers("ABC");

      expect(events).toHaveLength(1);
      expect(events[0].assetPossessionChange?.assetName).toBe("ABC");
      expect(events[0].assetPossessionChange?.numberOfShares).toBe("50");
    });
  });

  describe("getAssetListWithActivity", () => {
    it("counts recent transfers and volume per asset", async () => {
      stubFetch({
        liveIssuances: [liveIssuance("AAA", 1), liveIssuance("BBB", 2)],
        queryPages: [
          [
            transferEvent("AAA", "10", "t1"),
            transferEvent("AAA", "15", "t2"),
            transferEvent("BBB", "5", "t3"),
          ],
        ],
      });

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