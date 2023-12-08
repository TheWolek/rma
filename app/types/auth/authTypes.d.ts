export interface registerAccount {
  login: string
  password: string
  roles: string[]
}

export interface loginData {
  login: string
  password: string
}

export interface userLoginData extends loginData {
  user_id: number
  user_role_id: number
}
