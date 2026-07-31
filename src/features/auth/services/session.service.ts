import { SessionRepository } from "../repositories/session.repository";

export const SessionService = {
  async getLastLogin(userId: string): Promise<Date | null> {
    try {
      return await SessionRepository.getLastLogin(userId);
    } catch {
      return null;
    }
  },

  async validateSession(sessionToken: string): Promise<boolean> {
    if (!sessionToken) {
      return false;
    }
    return true;
  },
};
