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

export interface authState {
    public_id : string,
    email : string,
    username : string,
    bio : string,
    photoUrl? : string | undefined,
    isAuthenticated : boolean,
    setAuthData : (data: authTypes) => void,
    setPhoto : (data: Partial<authTypes>) => void,
    loggout : () => void
}

export interface authTypes {
    public_id : string,
    email : string ,
    username : string,
    bio : string,
    photoUrl? : string | undefined,
    isAuthenticated : boolean
}
