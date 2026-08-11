import { describe, it, expect } from "vitest";
import {
  formatBalance,
  formatCurrency,
  formatPercent,
  formatAddress,
  formatTick,
  formatCompact,
  timeAgo,
  formatEventTimestamp,
  formatQuPrice,
} from "./format";

describe("formatBalance", () => {
  it("formats numbers with commas", () => {
    expect(formatBalance(1000000)).toBe("1,000,000");
  });

  it("formats zero", () => {
    expect(formatBalance(0)).toBe("0");
  });

  it("formats small numbers", () => {
    expect(formatBalance(42)).toBe("42");
  });
});

describe("formatCurrency", () => {
  it("formats USD values", () => {
    expect(formatCurrency(1.5)).toBe("$1.50");
  });

  it("formats small values with more decimals", () => {
    expect(formatCurrency(0.000001)).toBe("$0.000001");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatPercent", () => {
  it("formats positive percentages", () => {
    expect(formatPercent(5.25)).toBe("+5.25%");
  });

  it("formats negative percentages", () => {
    expect(formatPercent(-3.14)).toBe("-3.14%");
  });

  it("formats zero", () => {
    expect(formatPercent(0)).toBe("+0.00%");
  });
});

describe("formatAddress", () => {
  it("truncates long addresses", () => {
    const addr = "GZCNUSHKABXFGBVYDMEDOMXHHIRAPZZSMRYVVEAGDGMKHMCAEHJSZRVGIQPM";
    expect(formatAddress(addr)).toBe("GZCNUS...VGIQPM");
  });

  it("returns short addresses as-is", () => {
    expect(formatAddress("ABC")).toBe("ABC");
  });

  it("respects custom char count", () => {
    const addr = "GZCNUSHKABXFGBVYDMEDOMXHHIRAPZZSMRYVVEAGDGMKHMCAEHJSZRVGIQPM";
    expect(formatAddress(addr, 10)).toBe("GZCNUSHKAB...JSZRVGIQPM");
  });
});

describe("formatTick", () => {
  it("formats tick numbers", () => {
    expect(formatTick(69620564)).toBe("69,620,564");
  });
});

describe("formatCompact", () => {
  it("formats large numbers", () => {
    expect(formatCompact(1500000)).toBe("1.5M");
  });
});

describe("formatEventTimestamp", () => {
  it("parses millisecond string timestamps from event logs", () => {
    expect(formatEventTimestamp("1785955349000")).toBe("Aug 5, 2026");
  });

  it("parses ISO timestamps", () => {
    expect(formatEventTimestamp("2026-01-05T00:00:00.000Z")).toBe(
      "Jan 5, 2026"
    );
  });

  it("returns a dash for invalid timestamps", () => {
    expect(formatEventTimestamp("")).toBe("—");
    expect(formatEventTimestamp("not-a-date")).toBe("—");
  });
});

describe("formatQuPrice", () => {
  it("formats whole QU prices", () => {
    expect(formatQuPrice(15.5)).toBe("15.5 QU");
  });

  it("formats thousands with K", () => {
    expect(formatQuPrice(120001)).toBe("120.00K QU");
  });

  it("formats millions with M", () => {
    expect(formatQuPrice(1500000)).toBe("1.50M QU");
  });

  it("formats billions with B", () => {
    expect(formatQuPrice(3000000000)).toBe("3.00B QU");
  });

  it("formats small prices with more decimals", () => {
    expect(formatQuPrice(0.375)).toBe("0.375 QU");
  });

  it("formats null as dash", () => {
    expect(formatQuPrice(null)).toBe("—");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent timestamps", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(timeAgo(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = Math.floor(Date.now() / 1000) - 300;
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = Math.floor(Date.now() / 1000) - 7200;
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });
});
