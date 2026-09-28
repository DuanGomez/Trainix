export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  gymId: string | null;
}
