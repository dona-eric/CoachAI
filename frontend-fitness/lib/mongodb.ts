import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Variable MONGODB_URI manquante dans .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  tls: true,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 30_000,
  heartbeatFrequencyMS: 10_000,
  maxPoolSize: 10,
};

type MongoGlobal = typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

function getGlobal(): MongoGlobal {
  return global as MongoGlobal;
}

function connect(): Promise<MongoClient> {
  const globalWithMongo = getGlobal();
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClient = client;
    globalWithMongo._mongoClientPromise = client.connect().catch(error => {
      globalWithMongo._mongoClient = undefined;
      globalWithMongo._mongoClientPromise = undefined;
      throw error;
    });
  }
  return globalWithMongo._mongoClientPromise;
}

const clientPromise = connect();
// Keep the module-level promise available to Auth.js without creating an unhandled rejection
// when Atlas is temporarily unavailable during startup.
void clientPromise.catch(() => undefined);

export default clientPromise;

// Helpers pour accéder aux collections typées
export async function getDb() {
  try {
    const client = await connect();
    return client.db("kinetic");
  } catch {
    // A failed Atlas handshake can leave the cached pool unusable; retry once with a fresh client.
    const globalWithMongo = getGlobal();
    globalWithMongo._mongoClientPromise = undefined;
    globalWithMongo._mongoClient = undefined;
    const client = await connect();
    return client.db("kinetic");
  }
}
