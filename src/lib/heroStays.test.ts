import { describe, expect, it } from "vitest";
import { isHeroPhoto, isPhonePhoto } from "./heroStays";

describe("isHeroPhoto", () => {
  it("takes a large landscape photo", () => {
    expect(isHeroPhoto({ width: 2400, height: 1600 })).toBe(true);
  });
  it("refuses a small photo, however wide", () => {
    expect(isHeroPhoto({ width: 1200, height: 600 })).toBe(false);
  });
  it("refuses a large portrait or near-square photo", () => {
    expect(isHeroPhoto({ width: 2000, height: 3000 })).toBe(false);
    expect(isHeroPhoto({ width: 2000, height: 1800 })).toBe(false);
  });
});

describe("isPhonePhoto", () => {
  it("takes a large portrait photo", () => {
    expect(isPhonePhoto({ width: 2000, height: 3000 })).toBe(true);
  });
  it("refuses landscape, near-square and small photos", () => {
    expect(isPhonePhoto({ width: 3000, height: 2000 })).toBe(false);
    expect(isPhonePhoto({ width: 2000, height: 2000 })).toBe(false);
    expect(isPhonePhoto({ width: 600, height: 900 })).toBe(false);
  });
});
