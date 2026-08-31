import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body('password') password: string) {
    const token = this.authService.login(password);
    if (!token) {
      throw new UnauthorizedException('Nesprávné heslo');
    }
    return { token };
  }
}
