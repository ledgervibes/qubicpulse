import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchOrderBook,
  fetchOrderBooksInChunks,
  clearOrderBookCache,
} from "./orderbook";

const mockQuery = vi.fn();

vi.mock("./qubic-rpc", () => ({
  querySmartContract: (...args: unknown[]) => mockQuery(...args),
}));

const ISSUER =
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function buildOrder(price: bigint, numberOfShares: bigint): Uint8Array {
  const order = new Uint8Array(48);
  const view = new DataView(order.buffer);
  view.setBigInt64(32, price, true);
  view.setBigInt64(40, numberOfShares, true);
  return order;
}

function buildResponse(orders: Uint8Array[]): Uint8Array {
  const response = new Uint8Array(orders.length * 48);
  orders.forEach((order, i) => response.set(order, i * 48));
  return response;
}

beforeEach(() => {
  mockQuery.mockReset();
  clearOrderBookCache();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: false, json: async () => ({}) }))
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("orderbook service", () => {
  describe("fetchOrderBook", () => {
    it("builds a 48-byte request with issuer, asset name and offset", async () => {
      mockQuery.mockImplementation(async (_ci, _inputType, inputSize, requestData) => {
        expect(inputSize).toBe(48);
        expect(requestData).toBeInstanceOf(Uint8Array);
        expect(requestData.byteLength).toBe(48);
        const nameBytes = new TextDecoder().decode(requestData.slice(32, 40));
        const end = nameBytes.indexOf("\u0000");
        expect(end === -1 ? nameBytes : nameBytes.slice(0, end)).toBe("QHEART");
        const offset = Number(
          new DataView(requestData.buffer, requestData.byteOffset + 40, 8).getBigUint64(0, true)
        );
        expect(offset).toBe(0);
        return buildResponse([]);
      });

      await fetchOrderBook(ISSUER, "qheart");
    });

    it("parses bids and asks, filters zero shares, computes best and mid", async () => {
      mockQuery.mockImplementation(async (_ci, inputType) => {
        if (inputType === 2) {
          return buildResponse([
            buildOrder(150n, 10n),
            buildOrder(120n, 5n),
            buildOrder(300n, 0n),
          ]);
        }
        return buildResponse([
          buildOrder(140n, 8n),
          buildOrder(100n, 3n),
          buildOrder(0n, 0n),
        ]);
      });

      const orderBook = await fetchOrderBook(ISSUER, "PORTAL");

      expect(orderBook.asks.map((a) => a.price)).toEqual([120, 150]);
      expect(orderBook.bids.map((b) => b.price)).toEqual([140, 100]);
      expect(orderBook.bestAsk).toBe(120);
      expect(orderBook.bestBid).toBe(140);
      expect(orderBook.midPrice).toBe(130);
    });

    it("returns null bests and single-sided mid when one side is empty", async () => {
      mockQuery.mockImplementation(async (_ci, inputType) => {
        if (inputType === 2) {
          return buildResponse([buildOrder(1000n, 4n)]);
        }
        return buildResponse([]);
      });

      const orderBook = await fetchOrderBook(ISSUER, "QHEART");

      expect(orderBook.bestBid).toBeNull();
      expect(orderBook.bestAsk).toBe(1000);
      expect(orderBook.midPrice).toBe(1000);
    });

    it("uses the worker proxy when it responds with an orderbook", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => ({
          ok: true,
          json: async () => ({
            bids: [{ price: 2, numberOfShares: 100 }],
            asks: [{ price: 3, numberOfShares: 100 }],
            bestBid: 2,
            bestAsk: 3,
            midPrice: 2.5,
          }),
        }))
      );

      const orderBook = await fetchOrderBook(ISSUER, "CFB");

      expect(orderBook.bestBid).toBe(2);
      expect(orderBook.bestAsk).toBe(3);
      expect(orderBook.midPrice).toBe(2.5);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("caches within TTL", async () => {
      mockQuery.mockImplementation(async (_ci, inputType) =>
        buildResponse(
          inputType === 2 ? [buildOrder(50n, 2n)] : [buildOrder(40n, 2n)]
        )
      );

      await fetchOrderBook(ISSUER, "CFB");
      await fetchOrderBook(ISSUER, "CFB");

      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe("fetchOrderBooksInChunks", () => {
    it("loads assets in chunks and reports progress", async () => {
      mockQuery.mockImplementation(async (_ci, inputType) =>
        buildResponse(
          inputType === 2 ? [buildOrder(10n, 1n)] : [buildOrder(9n, 1n)]
        )
      );

      const assets = [
        { name: "AAA", issuer: ISSUER },
        { name: "BBB", issuer: ISSUER },
        { name: "CCC", issuer: ISSUER },
      ];
      const chunks: Array<{ size: number }> = [];

      await fetchOrderBooksInChunks(assets, 2, 2, (results) => {
        chunks.push({ size: results.size });
      });

      expect(chunks.map((c) => c.size)).toEqual([2, 1]);
    });

    it("skips assets that fail to load", async () => {
      mockQuery.mockImplementation(async (_ci, inputType) => {
        if (inputType === 2) throw new Error("boom");
        return buildResponse([]);
      });

      const results: Map<string, unknown> = new Map();
      await fetchOrderBooksInChunks(
        [{ name: "BAD", issuer: ISSUER }],
        1,
        1,
        (r) => {
          for (const [k, v] of r) results.set(k, v);
        }
      );

      expect(results.size).toBe(0);
    });
  });
});
