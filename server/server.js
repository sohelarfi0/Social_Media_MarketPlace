// import express from 'express';
// import 'dotenv/config';
// import cors from "cors";
// import { clerkMiddleware } from '@clerk/express';
// import {serve} from 'inngest/express';
// import {inngest, functions} from './inngest/index.js';


// const app = express();

// app.use(express.json());
// app.use(cors())
// app.use(clerkMiddleware())


// app.get("/", (req, res)=>res.send("Server is live"))
// app.use("/api/inngest", serve({client: inngest, functions}))

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))




import express from 'express';
import 'dotenv/config';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest, functions } from './inngest/index.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is live"));
app.use("/api/inngest", serve({ client: inngest, functions }));

// Run locally but not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;