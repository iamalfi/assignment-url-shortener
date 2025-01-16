import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/utils/supabase.service';

interface IMedia {
  data: {
    path: string;
    id: string;
    fullPath: string;
  };

  error: any;
}
@Injectable()
export class MediaService {
  private supabase = this.supabaseService.getClient();

  constructor(private supabaseService: SupabaseService) {}

  async uploadFile(file: Express.Multer.File, folder: string) {
    const date = Date.now();
    const fileName = `${folder}/${date}_${file.originalname}`;

    const { data, error } = (await this.supabase.storage
      .from(process.env.BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      })) as IMedia;
    if (error) throw new BadRequestException(error);

    return {
      status: 'OK',
      url: `${data.fullPath}`,
    };
  }
  async uploadFiles(files: Array<Express.Multer.File>, folder: string) {
    if (files.length > 10)
      throw new BadRequestException('Maximum number of files allowed is 10');
    const uploadPromises = files.map(async (file) => {
      const date = Date.now();
      const fileName = `${folder}/${date}_${file.originalname}`;

      const { data, error } = (await this.supabase.storage
        .from(process.env.BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        })) as IMedia;
      if (error) throw new BadRequestException(error);
      return `${data.fullPath}`;
    });

    const results = await Promise.all(uploadPromises);

    return {
      status: 'OK',
      url: results,
    };
  }
}
