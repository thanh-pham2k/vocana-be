import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signUp(@Body() signUpDto: Record<string, any>) {
    return this.authService.signUp(signUpDto.username, signUpDto.password);
  }


  @Get('me')
  async getCurrentUser(@Request() request: any) {
    const authHeader = request.headers?.authorization || request.headers?.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { code: -1, message: 'Authorization header missing or malformed' };
    }

    const token = authHeader.replace('Bearer ', '').trim();
    return this.authService.getUserFromAccessToken(token);
  }
}
