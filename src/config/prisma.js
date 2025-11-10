// Attempt to import Prisma Client
try {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
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
