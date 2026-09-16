import z from "zod";

const registerSchema = z.object({
    username : z.string()
    .min(3, "El nombre de usuario debe tener mínimo 3 caracteres")
    .max(20, "El nombre de usuario debe tener máximo 20 caracteres"),

    email : z.email("Email inválido"),
    
    password : z.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .max(20, "La contraseña supera la cantidad de caracteres (20)")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe tener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),

    confirmPassword : z.string()
})
.refine((data) => data.password === data.confirmPassword, {
    message : "Las contraseñas no coinciden",
    path : ["confirmPassword"]
})


const loginSchema = z.object({
  email: z.email("Email inválido"),
  
  password: z.string()
    .min(1, "La contraseña es obligatoria.")
});

export {registerSchema, loginSchema}