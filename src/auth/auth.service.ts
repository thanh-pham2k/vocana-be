import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly jwtSecret = "s8JXf2QwPNyV8R!aZ4u6@3hB9KmE1tLqD7$gWv#pFzHnUcXsOjIrT0Md5LyCeQa";
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  /**
   * Đăng nhập, cấp JWT 7 ngày, trả về wrapper
   */
  async signIn(username: string, password: string): Promise<{ code: number, message: string, data?: { accessToken: string } }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username: username },
      });

      if (!user || user.passwordHash !== password) {
        return {
          code: -1,
          message: 'Invalid username or password',
        };
      }

      const payload = { username: user.username, userId: user.id };
      const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

      return {
        code: 0,
        message: 'Login successful',
        data: { accessToken },
      };
    } catch (error) {
      return {
        code: -1,
        message: 'An error occurred during sign in',
      };
    }
  }

  /**
   * Đăng ký tài khoản, trả về wrapper
   */
  async signUp(username: string, password: string): Promise<{ code: number, message: string }> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: username },
      });

      if (existingUser) {
        return {
          code: -1,
          message: 'Username already exists',
        };
      }

      await this.prisma.user.create({
        data: {
          username: username,
          passwordHash: password,
          status: 'active',
          email: username,
        },
      });

      return {
        code: 0,
        message: 'Account created successfully',
      };
    } catch (error) {
      return {
        code: -1,
        message: 'An error occurred during sign up',
      };
    }
  }

  /**
   * Lấy thông tin user từ access token
   */
  async getUserFromAccessToken(accessToken: string): Promise<{ code: number, message: string, data?: any }> {
    try {
      // Giải mã access token để lấy thông tin userId
      const decodedToken = this.jwtService.verify(accessToken);
      if (!decodedToken || !decodedToken.userId) {
        return {
          code: -1,
          message: 'Invalid or expired access token',
        };
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decodedToken.userId },
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          fullName: true,
          avatarUrl: true,
          birthday: true,
          targetLanguage: true,
          targetLevel: true,
          bio: true,
        },
      });

      if (!user) {
        return {
          code: -1,
          message: 'User not found',
        };
      }

      return {
        code: 0,
        message: 'User fetched successfully',
        data: user,
      };
    } catch (error) {
      return {
        code: -1,
        message: 'Failed to get user from access token',
      };
    }
  }
}