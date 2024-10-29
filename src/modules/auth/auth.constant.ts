export const Roles = {
    ADMIN: 'admin',
    USER: 'user',
    // GUEST: 'guest',
  } as const
  
  export type Role = (typeof Roles)[keyof typeof Roles]
  