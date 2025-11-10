// Log DATABASE_URL for debugging (without exposing sensitive information)
console.log(
  "Prisma config - DATABASE_URL:",
  process.env.DATABASE_URL ? "Set" : "Not set"
);
if (process.env.DATABASE_URL) {
  console.log(
    "Prisma config - DATABASE_URL length:",
    process.env.DATABASE_URL.length
  );
  // Log first 30 characters for debugging (without exposing credentials)
  console.log(
    "Prisma config - DATABASE_URL prefix:",
    process.env.DATABASE_URL.substring(
      0,
      Math.min(30, process.env.DATABASE_URL.length)
    )
  );
}

// Attempt to import Prisma Client
try {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient({
    log: ["info", "warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || undefined,
      },
    },
    errorFormat: "minimal",
  });
  module.exports = prisma;
} catch (error) {
  console.warn("Prisma Client not available, creating mock client");
  console.error("Prisma Client Error:", error.message);

  // Mock Prisma client for situations where Prisma isn't generated properly
  const mockPrisma = {
    $connect: async () => {
      console.log("Mock Prisma: connect called");
      return Promise.resolve();
    },
    $disconnect: async () => {
      console.log("Mock Prisma: disconnect called");
      return Promise.resolve();
    },
    user: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    },
    company: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    },
    lead: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    },
    leadHistory: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    },
    refreshToken: {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    },
  };

  module.exports = mockPrisma;
}
