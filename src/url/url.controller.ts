import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { GetUser } from 'src/decorator/user.decorator';
import { UserGuard } from 'src/guards/user.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('URL') // Group this controller under the "URL" category in Swagger
@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiBearerAuth() // Indicate that this route requires a bearer token
  @ApiOperation({ summary: 'Create a new shortened URL' }) // Description for the route
  @ApiResponse({
    status: 201,
    description: 'The URL has been successfully created.',
    schema: {
      example: {
        url: 'https://example.com/web/jfhjdf',
      },
    },
  })
  @ApiBody({
    description: 'Data to create a shortened URL',
    type: CreateUrlDto,
  })
  create(@Body() createUrlDto: CreateUrlDto, @GetUser() user) {
    return this.urlService.create(user, createUrlDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Retrieve all URLs' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all URLs.',
    schema: {
      example: [
        {
          id: 'cuid123456789',
          original_url: 'https://example.com',
          short_code: 'abc123',
          click_count: 0,
          userId: 'user123',
          createdAt: '2025-01-16T00:00:00.000Z',
          updatedAt: '2025-01-16T00:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.urlService.findAll();
  }

  @Get('by/user')
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch URLs by user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all URLs associated with the logged-in user.',
    schema: {
      example: [
        {
          id: 'cuid123456789',
          original_url: 'https://example.com',
          short_code: 'abc123',
          click_count: 0,
          userId: 'user123',
          createdAt: '2025-01-16T00:00:00.000Z',
          updatedAt: '2025-01-16T00:00:00.000Z',
        },
      ],
    },
  })
  fetchByUser(@GetUser() user) {
    return this.urlService.fetchByUser(user);
  }
  @Get('analytics')
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch URLs analytics by user' })
  @ApiResponse({
    status: 200,
    // schema: {
    //   example: [
    //     {
    //       id: 'cuid123456789',
    //       original_url: 'https://example.com',
    //       short_code: 'abc123',
    //       click_count: 0,
    //       userId: 'user123',
    //       createdAt: '2025-01-16T00:00:00.000Z',
    //       updatedAt: '2025-01-16T00:00:00.000Z',
    //     },
    //   ],
    // },
  })
  analyticsforUser(@GetUser() user) {
    return this.urlService.analyticsforUser(user);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Find a original URL by its short code' })
  @ApiParam({
    name: 'code',
    description: 'The short code for the URL',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the URL associated with the provided short code.',
    schema: {
      example: {
        url: 'https://example.com',
      },
    },
  })
  findOne(@Param('code') code: string) {
    return this.urlService.findOne(code);
  }

  @Delete('delete/:id')
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a URL by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the URL to be deleted',
    example: 'cuid123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'The URL has been successfully deleted.',
    schema: {
      example: {
        message: 'URL deleted successfully.',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.urlService.remove(id);
  }
}
