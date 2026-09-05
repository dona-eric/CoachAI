import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Variable MONGODB_URI manquante dans .env.local');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // En développement, réutilise la connexion entre les hot-reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // En production, nouvelle connexion à chaque instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Helpers pour accéder aux collections typées
export async function getDb() {
  const client = await clientPromise;
  return client.db("kinetic");
}
