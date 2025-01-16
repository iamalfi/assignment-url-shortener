import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { AdminLoginDto, CreateAdminDto } from './dto/admin.dto';

const EXPIRE_TIME_5_HOURS = 5 * 60 * 60 * 1000; // 18,000,000 milliseconds (5 hours)
const EXPIRE_TIME_7_DAYS = 7 * 24 * 60 * 60 * 1000; // 604,800,000 milliseconds (7 days)

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateAdminDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (admin) throw new ConflictException('Admin Email already exists');

    const newAdmin = await this.prisma.admin.create({
      data: {
        ...dto,
        provider: 'credentials',
        password: await hash(dto.password, 10),
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = newAdmin;

    return result;
  }

  async findByEmail(email: string) {
    return await this.prisma.admin.findUnique({
      where: {
        email: email,
      },
    });
  }
  async findById(id: string) {
    return await this.prisma.admin.findUnique({
      where: {
        id: id,
      },
    });
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.validateAdmin(dto);
    const payload = {
      id: admin.id,
      email: admin.email,
      sub: {
        name: admin.name,
      },
    };
    return {
      admin,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY_DATE,
          secret: process.env.jwtAdminSecretKey,
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

  async validateAdmin(dto: AdminLoginDto) {
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
        secret: process.env.jwtAdminSecretKey,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY_DATE,
        secret: process.env.jwtRefreshTokenKey,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME_7_DAYS),
    };
  }
}
