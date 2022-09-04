import User from "App/Models/User";
import Encryption from "@ioc:Adonis/Core/Encryption";

export type TokenGenerator<T = unknown> = {
  createToken: (user: User, expiresIn?: string | number) => string;
  decryptToken: (token: string) => T | null;
};

export const VerifyToken: TokenGenerator<string> = {
  createToken: (user: User, expiresIn = "24 hours") =>
    Encryption.encrypt(user.id, expiresIn, "verifyEmail"),
  decryptToken: (token: string) => Encryption.decrypt(token, "verifyEmail"),
};

export const ResendToken: TokenGenerator<string> = {
  createToken: (user: User, expiresIn = "5 minutes") =>
    Encryption.encrypt(user.id, expiresIn, "resendToken"),
  decryptToken: (token: string) => Encryption.decrypt(token, "resendToken"),
};

export const PasswordResetToken: TokenGenerator<[string, string]> = {
  createToken: (user: User, expiresIn = "24 hours") =>
    Encryption.encrypt([user.id, user.password], expiresIn, "passwordReset"),
  decryptToken: (token: string) => Encryption.decrypt(token, "passwordReset"),
};
