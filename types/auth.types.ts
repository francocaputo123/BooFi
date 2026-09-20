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
    isAuthenticated : boolean,
    setAuthData: (data: authTypes) => void,
    loggout : () => void
}

export interface authTypes {
    public_id : string,
    email : string,
    isAuthenticated : boolean
}
