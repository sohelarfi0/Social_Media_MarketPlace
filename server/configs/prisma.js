// import 'dotenv/config';
// import { PrismaClient } from '@prisma/client';
// import {PrismaNeon} from '@prisma/adapter-neon';
// import { neonConfig } from '@neondatabase/serverless';
// import ws from 'ws';

// neonConfig.webSocketConstructor = ws;
// // to work in edge environment(Cloudfare workers, vercel edge, etc.), enable querying over fetch

// neonConfig.poolQueryViaFetch = true
// // Type definations 
// // declare global {
// // var prisma: PrismaClient | undefined
// // }


// const connectionString = `${process.env.DATABASE_URL}`;
// const adapter = new PrismaNeon({connectionString});
// const prisma = global.prisma || new PrismaClient({adapter});
// if(process.env.NODE_ENV === 'development') global.prisma;


// export default prisma;


import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'development') global.prisma = prisma; // ✅ fixed

export default prisma;