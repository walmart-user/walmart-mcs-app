import { PrismaClient } from "@prisma/client";
import { isLocalDevelopment } from "./config";

// Create a mock Prisma client for local development
class MockPrismaClient {
  session = {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data: any) => data.data,
    update: async (data: any) => data.data,
    delete: async () => ({}),
    deleteMany: async () => ({ count: 0 }),
  };
  
  // Add other models as needed
}

// Define global types
declare global {
  var prismaGlobal: PrismaClient;
  var mockPrismaGlobal: MockPrismaClient;
}

// Initialize the appropriate global variable based on environment
if (process.env.NODE_ENV !== "production") {
  if (isLocalDevelopment && !global.mockPrismaGlobal) {
    global.mockPrismaGlobal = new MockPrismaClient();
  } else if (!isLocalDevelopment && !global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

// Use the appropriate client based on environment
const prisma = isLocalDevelopment 
  ? (global.mockPrismaGlobal ?? new MockPrismaClient())
  : (global.prismaGlobal ?? new PrismaClient());

export default prisma;
