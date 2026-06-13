import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto, MfaVerifyDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Request() req) { return this.authService.login(req.user); }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA token after login' })
  verifyMfa(@Body() dto: MfaVerifyDto & { userId: string }) {
    return this.authService.verifyMfaAndLogin(dto.userId, dto.token);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body('refreshToken') refreshToken: string) { return this.authService.refreshToken(refreshToken); }

  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) { return this.authService.forgotPassword(dto.email); }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.resetToken, dto.newPassword);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
