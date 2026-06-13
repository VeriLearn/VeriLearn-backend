import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  async register(dto: RegisterDto) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await this.usersService.create({ ...dto, emailVerificationToken: verificationToken });
    // Fire-and-forget — don't fail registration if email fails
    this.emailService.sendWelcome(user.email, user.firstName).catch(() => null);
    this.emailService.sendEmailVerification(user.email, verificationToken).catch(() => null);
    return this.generateTokens(user);
  }

  async login(user: User) {
    if (user.isMfaEnabled) {
      return { requiresMfa: true, userId: user.id };
    }
    return this.generateTokens(user);
  }

  async verifyMfaAndLogin(userId: string, token: string) {
    const valid = await this.usersService.verifyMfaToken(userId, token);
    if (!valid) throw new UnauthorizedException('Invalid MFA token');
    const user = await this.usersService.findById(userId);
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      const user = await this.usersService.findById(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    // Always return same message to avoid user enumeration
    if (!user) return { message: 'If the email exists, a reset link has been sent' };
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour
    await this.usersService.setPasswordResetToken(user.id, token, expires);
    this.emailService.sendPasswordReset(user.email, token).catch(() => null);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    await this.usersService.resetPassword(user.id, newPassword);
    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid verification token');
    await this.usersService.markEmailVerified(user.id);
    return { message: 'Email verified successfully' };
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      }),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }
}
