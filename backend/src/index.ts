import { Hono } from "hono";

import { userRouter } from "./routes/user";
import { postRouter } from "./routes/post";

const app = new Hono<{ Bindings: Bindings }>();

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET : string
}; // needed for eradicating the typescript error caused while using environment variable in the index.ts file

// Create the main Hono app

app.route('/api/v1',userRouter);
app.route('/api/vi/blog',postRouter);





export default app;
