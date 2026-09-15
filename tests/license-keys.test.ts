import { describe, it, expect } from "vitest";
import {
  generateLicenseCode,
  normalizeLicenseCode,
  LicenseKeyService,
} from "@/services/license/license-key-service";

describe("License key helpers", () => {
  it("normalizes codes to uppercase without spaces", () => {
    expect(normalizeLicenseCode("  didak-plus-ab12-cd34  ")).toBe("DIDAK-PLUS-AB12-CD34");
  });

  it("generates codes with plan prefix", () => {
    const code = generateLicenseCode("PLUS");
    expect(code).toMatch(/^DIDAK-PLUS-[A-F0-9]{4}-[A-F0-9]{4}$/);
  });

  it("restricts school keys to school admins", () => {
    const service = new LicenseKeyService();
    expect(service.assertRoleCanRedeem("SCHOOL", "STUDENT", "sch1")).toBeTruthy();
    expect(service.assertRoleCanRedeem("SCHOOL", "SCHOOL_ADMIN", "sch1")).toBeNull();
    expect(service.assertRoleCanRedeem("SMALL_SCHOOL", "SCHOOL_ADMIN", "sch1")).toBeNull();
    expect(service.assertRoleCanRedeem("SCHOOL_PLUS", "TEACHER", "sch1")).toBeTruthy();
    expect(service.assertRoleCanRedeem("PLUS", "STUDENT", null)).toBeNull();
    expect(service.assertRoleCanRedeem("PLUS", "TEACHER", null)).toBeTruthy();
    expect(service.assertRoleCanRedeem("TEACHER", "TEACHER", null)).toBeNull();
  });

  it("generates SMALL_SCHOOL and SCHOOL_PLUS prefixes", () => {
    expect(generateLicenseCode("SMALL_SCHOOL")).toMatch(/^DIDAK-SMLS-[A-F0-9]{4}-[A-F0-9]{4}$/);
    expect(generateLicenseCode("SCHOOL_PLUS")).toMatch(/^DIDAK-SCHP-[A-F0-9]{4}-[A-F0-9]{4}$/);
  });
});
