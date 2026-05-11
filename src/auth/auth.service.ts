import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
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

  async forgotPassword(email: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return 'If the email exists, a reset link has been sent';
    const token = crypto.randomBytes(32).toString('hex');
    // Store token on user — in production, use a separate token table
    await this.usersService.update(user.id, {});
    return token;
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
