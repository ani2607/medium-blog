import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from "hono/jwt";
import { createPostInput,updatePostInput } from "@tekina/common2";

export const postRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

postRouter.use("/*", async (c, next) => {
  // middleware for authenticating the request
  const authHeader = c.req.header("authorization") || "";

  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);

  if (user) {
    c.set("userId", user.id);
    await next();
  } else {
    c.status(403);
    return c.json({
      message: "You are not logged in",
    });
  }
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.json({
      message : "unauthorized access"
    })
  }
  
});

postRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const id = c.req.param("id");

  try {
    const res = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });

    console.log(res);
    c.status(200);
    return c.json({
      res,
    });
  } catch (error) {
    console.log(error);

    c.status(411);
    c.json({
      message: "errow while fetching the post",
    });
  }
});

postRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const res = await prisma.post.findMany();

    // added a pagination logic at the backend
    const page = parseInt(c.req.query("page") || "");
    const limit = parseInt(c.req.query("limit") || "");

    if (!page || !limit) {
      return c.json({
        res,
      });
    }

    const startPage = (page - 1) * limit; // indexing of array is from zero
    const endPage = page * limit;

    const finalPost = res.slice(startPage, endPage);
    return c.json({
      finalPost,
    });
  } catch (error) {
    console.log(error);

    c.status(411);
    return c.json({
      message: "errow while fetching the post ",
    });
  }
});

postRouter.post("/blog", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const {success} = createPostInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message : "please write correct post"
    })
  }
  const userId : string = c.get("userId");

  try {
    const res = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        userid: userId,
      },
    });

    c.status(200);
    return c.json({
      id: res.id,
    });
  } catch (error) {
    console.log(error);

    c.status(411);
    return c.json({
      message: "error while creating the post ",
    });
  }
});

postRouter.put("/blog", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

 

  try {
    const body = await c.req.json();
    const {success} = updatePostInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message : "wrong updated inputs"
      })
    }
    const res = await prisma.post.update({
      where: {
        id: body.id,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    c.status(200);
    return c.json({
      id: res.id,
    });
  } catch (error) {
    console.log(error);

    c.status(411);
    return c.json({
      message: "error while updating the post  ",
    });
  }
});
