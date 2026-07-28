import { describe, it, expect, beforeEach } from "vitest";
import { getItem, setItem, removeItem, exportAll } from "./storage";

const PREFIX = "qubicpulse_";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getItem", () => {
    it("returns fallback when key doesn't exist", () => {
      expect(getItem("nonexistent", "default")).toBe("default");
    });

    it("returns stored value", () => {
      localStorage.setItem(PREFIX + "test", JSON.stringify("hello"));
      expect(getItem("test", "")).toBe("hello");
    });

    it("returns fallback on invalid JSON", () => {
      localStorage.setItem(PREFIX + "bad", "not-json");
      expect(getItem("bad", "fallback")).toBe("fallback");
    });
  });

  describe("setItem", () => {
    it("stores values with prefix", () => {
      setItem("key", "value");
      expect(localStorage.getItem(PREFIX + "key")).toBe('"value"');
    });

    it("stores objects", () => {
      setItem("obj", { a: 1 });
      expect(JSON.parse(localStorage.getItem(PREFIX + "obj")!)).toEqual({ a: 1 });
    });
  });

  describe("removeItem", () => {
    it("removes items with prefix", () => {
      localStorage.setItem(PREFIX + "test", "value");
      removeItem("test");
      expect(localStorage.getItem(PREFIX + "test")).toBeNull();
    });
  });

  describe("exportAll", () => {
    it("exports all prefixed items", () => {
      setItem("a", 1);
      setItem("b", 2);
      const exported = JSON.parse(exportAll());
      expect(exported.a).toBe(1);
      expect(exported.b).toBe(2);
    });
  });
});
