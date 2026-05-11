import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto, MfaVerifyDto, ForgotPasswordDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('login')
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) { return this.authService.forgotPassword(dto.email); }
}
