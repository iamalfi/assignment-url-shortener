import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { SupabaseService } from 'src/utils/supabase.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, SupabaseService],
})
export class MediaModule {}
