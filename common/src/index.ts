import z from 'zod';

export const signUpInput = z.object({
    username : z.string().optional(),
    email : z.string().email(),
    password : z.string().min(6)
})


export const signInInput = z.object({
    email : z.string().email(),
    password : z.string().min(6)
})

export const updatePostInput = z.object({
    title : z.string(),
    content : z.string(),
    id : z.string()
})
export const createPostInput = z.object({
    title : z.string(),
    content : z.string()
})

export type SignInInput = z.infer<typeof signInInput>;


export type SignUpInput = z.infer<typeof signUpInput> ;

export type CreatePostInput = z.infer<typeof createPostInput>;



export type UpdatePostInput = z.infer<typeof updatePostInput>;