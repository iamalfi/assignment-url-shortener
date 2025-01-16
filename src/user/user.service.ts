import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { OtpService } from 'src/otp/otp.service';
import { VerifyOtpDto } from 'src/otp/dto/otp.dto';

const EXPIRE_TIME_5_HOURS = 5 * 60 * 60 * 1000; // 18,000,000 milliseconds (5 hours)
const EXPIRE_TIME_7_DAYS = 7 * 24 * 60 * 60 * 1000; // 604,800,000 milliseconds (7 days)

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user) throw new ConflictException('User Email already exists');

    const newUser = await this.prisma.user.create({
      data: {
        ...dto,
        provider: 'credentials',
        password: await hash(dto.password, 10),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser;
    const otp = await this.otpService.generateOTPToken({
      email: result.email,
      url: process.env.VERIFY_CLIENT_EMAIL_URL,
    });
    return {
      token: otp.token,
      status: 'Ok',
      message: 'Verify your email address',
    };
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }
  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const payload = {
      id: user.id,
      email: user.email,
      sub: {
        name: user.name,
      },
    };

    if (!user.emailVerified) {
      await this.otpService.generateOTPToken({
        email: user.email,
        url: process.env.VERIFY_CLIENT_EMAIL_URL,
      });
      throw new UnauthorizedException('Your Email is not verified');
    }
    return {
      user,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DATE,
          secret: process.env.jwtUserSecretKey,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY_DATE,
          secret: process.env.jwtRefreshTokenKey,
        }),
        expiresIn: new Date().setTime(
          new Date().getTime() + EXPIRE_TIME_5_HOURS,
        ),
      },
    };
  }

  async googleLogin(dto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user) {
      if (user.provider === 'credentials')
        throw new UnauthorizedException('User already exists');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user ?? { password: null };
      const payload = {
        id: user.id,
        email: dto.email,
        sub: {
          name: dto.name,
        },
      };
      return {
        user: result,
        backendTokens: {
          accessToken: await this.jwtService.signAsync(payload, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DATE,
            secret: process.env.jwtUserSecretKey,
          }),
          refreshToken: await this.jwtService.signAsync(payload, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY_DATE,
            secret: process.env.jwtRefreshTokenKey,
          }),
          expiresIn: new Date().setTime(
            new Date().getTime() + EXPIRE_TIME_5_HOURS,
          ),
        },
      };
    }

    const newUser = await this.prisma.user.create({
      data: {
        ...dto,
        provider: 'google',
      },
    });
    if (!newUser) throw new ConflictException();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newUser ?? { password: null };
    const payload = {
      id: newUser.id,
      email: dto.email,
      sub: {
        name: dto.name,
      },
    };
    return {
      user: result,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DATE,
          secret: process.env.jwtUserSecretKey,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY_DATE,
          secret: process.env.jwtRefreshTokenKey,
        }),
        expiresIn: new Date().setTime(
          new Date().getTime() + EXPIRE_TIME_5_HOURS,
        ),
      },
    };
  }

  async validateUser(dto: LoginDto) {
    const user = await this.findByEmail(dto.email);
    if (user.password === null)
      throw new UnauthorizedException(
        'Your account was created using a third-party authentication provider (e.g., Google, Facebook). Please log in using the respective provider.',
      );
    if (user && (await compare(dto.password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Wrong email or password');
  }

  async refreshToken(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      sub: {
        name: user.name,
      },
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DATE,
        secret: process.env.jwtUserSecretKey,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY_DATE,
        secret: process.env.jwtRefreshTokenKey,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME_7_DAYS),
    };
  }

  async verifyEmail(dto: VerifyOtpDto) {
    const verify = await this.otpService.verifyOTPToken(dto);
    const user = await this.prisma.user.update({
      where: {
        email: verify.email,
      },
      data: {
        emailVerified: true,
      },
    });
    if (!user) throw new UnauthorizedException('user is not registered');

    return { status: 'OK', message: 'User Email Verified' };
  }
}
