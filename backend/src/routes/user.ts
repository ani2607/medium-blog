import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from 'hono/jwt'

import { signInInput,signUpInput } from "@tekina/common2";

export const  userRouter = new Hono<
    {
        Bindings:{
            DATABASE_URL :string,
            JWT_SECRET : string
        }
    }
>();

userRouter.post("/signup", async (c) => {
    // need to initialize this in every route as the global access of env in restricted by hono
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
  
    
  
    try {
      const body = await c.req.json();
      const {success} = signUpInput.safeParse(body);
      if(!success){
        c.status(411);
        return c.json({
          message : "wrong inputs "
        })
      }
      const res = await prisma.user.create({
        data: {
          username: body.username,
          email: body.email,
          password: body.password,
        },
      });
      const jwt_token = await sign({
          id : res.id 
      },c.env.JWT_SECRET); 
  
      // console.log(jwt_token);
      // console.log(res.id);
  
      return c.text("user added successfully!!");
    } catch (error) {
      // console.log("error while adding");
  
      c.status(411);
  
      return c.text("error while adding the user");
    }
  });
  

userRouter.post("/signin",async (c) => {
      const prisma = new PrismaClient({
          datasourceUrl: c.env?.DATABASE_URL,
        }).$extends(withAccelerate());
      
        
      
        try {
          const body = await c.req.json();
          const {success} = signInInput.safeParse(body);
          if(!success){
            c.status(411);
            return c.json({
              message : "wrong credentials"
            })
          }
          const res = await prisma.user.findFirst({
            where: {
              email: body.email,
              password: body.password,
            },
          });
  
          if(!res){
              c.status(403);
              return c.json({
                  "message" : "wrong credentials"
              })
          }
  
          const jwt_token = await sign({
              id : res.id 
          },c.env.JWT_SECRET); 
          
          // console.log(jwt_token);
          // console.log(res.id);
      
          return c.text(jwt_token);
        } catch (error) {
          // console.log("error while adding");
      
          c.status(411);
      
          return c.text("error while adding the user");
        }
  });