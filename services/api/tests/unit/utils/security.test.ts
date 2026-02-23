import {
  hashPassword,
  verifyPassword,
  generateSecureRandom,
  sha256,
  hmacSHA256,
} from "../../../src/utils/security";

describe("Security Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password correctly", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for same password (salt)", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });

    it("should hash password with bcrypt format", async () => {
      const hash = await hashPassword("password");
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("wrongPassword", hash);
      expect(isValid).toBe(false);
    });

    it("should return false for empty password", async () => {
      const hash = await hashPassword("testPassword123");
      const isValid = await verifyPassword("", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("generateSecureRandom", () => {
    it("should generate random string (hex format)", () => {
      const random = generateSecureRandom(32);
      expect(random).toBeDefined();
      expect(random.length).toBeGreaterThan(0);
    });

    it("should generate different strings each time", () => {
      const random1 = generateSecureRandom(32);
      const random2 = generateSecureRandom(32);
      expect(random1).not.toBe(random2);
    });

    it("should generate different lengths", () => {
      const random16 = generateSecureRandom(16);
      const random32 = generateSecureRandom(32);
      expect(random16.length).not.toBe(random32.length);
    });
  });

  describe("sha256", () => {
    it("should hash string to sha256", () => {
      const hash = sha256("test");
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(64);
    });

    it("should produce consistent hash for same input", () => {
      const hash1 = sha256("test");
      const hash2 = sha256("test");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hash for different input", () => {
      const hash1 = sha256("test1");
      const hash2 = sha256("test2");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("hmacSHA256", () => {
    it("should generate HMAC with secret", () => {
      const hmac = hmacSHA256("message", "secret");
      expect(hmac).toBeDefined();
      expect(typeof hmac).toBe("string");
    });

    it("should produce consistent HMAC for same input", () => {
      const hmac1 = hmacSHA256("message", "secret");
      const hmac2 = hmacSHA256("message", "secret");
      expect(hmac1).toBe(hmac2);
    });

    it("should produce different HMAC for different secrets", () => {
      const hmac1 = hmacSHA256("message", "secret1");
      const hmac2 = hmacSHA256("message", "secret2");
      expect(hmac1).not.toBe(hmac2);
    });
  });
});
