export type viewStatus = "login" | "signup"

export interface registerForm {
    username : string,
    email : string,
    password : string,
    confirmPassword : string 
}

export interface loginForm {
    email : string,
    password : string
}
