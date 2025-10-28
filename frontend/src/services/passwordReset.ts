import axiosInstance from '../lib/axios';

export interface SendResetLinkRequest {
  email: string;
}

export interface SendResetLinkResponse {
  message: string;
  token?: string; // Only returned in testing/local environment
}

export interface ValidateTokenRequest {
  email: string;
  token: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const passwordResetService = {
  /**
   * Send password reset link to user's email
   */
  async sendResetLink(data: SendResetLinkRequest): Promise<SendResetLinkResponse> {
    const response = await axiosInstance.post<SendResetLinkResponse>('/password/email', data);
    return response.data;
  },

  /**
   * Validate password reset token
   */
  async validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    const response = await axiosInstance.post<ValidateTokenResponse>('/password/validate-token', data);
    return response.data;
  },

  /**
   * Reset user password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await axiosInstance.post<ResetPasswordResponse>('/password/reset', data);
    return response.data;
  },
};
