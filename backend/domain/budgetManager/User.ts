export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
