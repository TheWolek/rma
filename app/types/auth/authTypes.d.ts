export interface RegisterAccount {
  login: string
  password: string
  roles: string[]
}

export interface LoginData {
  login: string
  password: string
}

export interface UserLoginData extends LoginData {
  user_id: number
  role: string
  change_password: 0 | 1
}

export interface ChangePasswordData extends LoginData {
  newPassword: string
}

export interface BlockUserData {
  user_id: number
  admin_id: number
}

export interface User {
  user_id: number
  login: string
  created_date: string | Date
  last_login_date: string | Date | null
  change_password: number | boolean
  role: string
}

export interface EditUserReqBody {
  change_password: boolean
  role: string
}

export interface EditUserData {
  user_id: number
  change_password: boolean
  role: string
}
