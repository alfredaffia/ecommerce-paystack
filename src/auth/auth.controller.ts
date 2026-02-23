import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  // private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email and password. Returns user data and JWT token.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      user: {
        summary: 'Regular User',
        value: {
          email: 'user@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        message: 'Registration successful',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    // this.logger.log(`Registration attempt: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user with email and password. Returns user data and JWT token.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      user: {
        summary: 'User Login',
        value: {
          email: 'user@example.com',
          password: 'SecurePass123!',
        },
      },
      admin: {
        summary: 'Admin Login',
        value: {
          email: 'admin@example.com',
          password: 'AdminPass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        message: 'Login successful',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account inactive',
  })
  async login(@Body() loginDto: LoginDto) {
    // this.logger.log(`Login attempt: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile. Requires JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getProfile(@CurrentUser() user: User) {
    // this.logger.log(`Profile accessed by: ${user.email}`);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
