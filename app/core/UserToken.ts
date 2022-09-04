import User from "App/Models/User";
import Encryption from "@ioc:Adonis/Core/Encryption";

export interface TokenGenerator<T = unknown> {
  createToken: (...args: unknown[]) => string;
  decryptToken: (token: string) => T | null;
}

export const VerifyToken = new (class implements TokenGenerator {
  createToken(user: User, expiresIn: string | number = "24 hours") {
    return Encryption.encrypt(user.id, expiresIn, "verifyEmail");
  }
  decryptToken(token: string) {
    return Encryption.decrypt<string>(token, "verifyEmail");
  }
})();

export const ResendToken = new (class implements TokenGenerator {
  createToken(user: User, expiresIn: string | number = "30 minutes") {
    return Encryption.encrypt(user.id, expiresIn, "resendToken");
  }
  decryptToken(token: string) {
    return Encryption.decrypt<string>(token, "resendToken");
  }
})();

export const PasswordResetToken = new (class implements TokenGenerator {
  createToken(user: User, expiresIn: string | number = "24 hours") {
    return Encryption.encrypt(
      [user.id, user.password],
      expiresIn,
      "passwordReset"
    );
  }
  decryptToken(token: string) {
    return Encryption.decrypt<[string, string]>(token, "passwordReset");
  }
})();

export const EmailChangeToken = new (class implements TokenGenerator {
  createToken(
    user: User,
    email: string,
    expiresIn: string | number = "24 hours"
  ) {
    return Encryption.encrypt([user.id, email], expiresIn, "emailChange");
  }
  decryptToken(token: string) {
    return Encryption.decrypt<[string, string]>(token, "emailChange");
  }
})();
