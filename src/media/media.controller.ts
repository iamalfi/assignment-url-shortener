import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nest-lab/fastify-multer';
import { MediaService } from './media.service';

const FILE_SIZE = 25 * 1024 * 1024;

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('/file')
  @ApiOperation({ summary: 'Uploads a single file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: FILE_SIZE } }))
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          maxLength: FILE_SIZE,
          description: 'Maximum file size is 25 MB',
        },
        folder: {
          type: 'string',
        },
      },
    },
  })
  async singleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string,
  ) {
    return await this.mediaService.uploadFile(file, folder);
  }

  @Post('/files')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Uploads multiple files' })
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: FILE_SIZE } }),
  )
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            maxLength: FILE_SIZE,
          },
          description:
            'Array of files to be uploaded. Maximum file size is 25 MB. Maximum number of files is 10.',
          minItems: 1,
          maxItems: 10,
        },
        folder: {
          type: 'string',
        },
      },
      additionalProperties: false,
    },
  })
  async multipleFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('folder') folder: string,
  ) {
    return await this.mediaService.uploadFiles(files, folder);
  }
}
