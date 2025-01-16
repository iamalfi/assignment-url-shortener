import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { RefreshJwtGuard } from 'src/guards/refresh.guard';
import { VerifyOtpDto } from 'src/otp/dto/otp.dto';
import { UserGuard } from 'src/guards/user.guard';
import { GetUser } from 'src/decorator/user.decorator';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Get()
  async getUserProfile(@GetUser() user: IUserPayload) {
    return await this.userService.findById(user.id);
  }

  @Post('register')
  async registerUser(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.userService.login(dto);
  }
  @Post('google')
  async otherLogin(@Body() dto: CreateUserDto) {
    return await this.userService.googleLogin(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return await this.userService.refreshToken(req.user);
  }

  @Post('verify')
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return await this.userService.verifyEmail(dto);
  }
}
