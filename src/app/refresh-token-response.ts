// models/refresh-token-request.model.ts
export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}
