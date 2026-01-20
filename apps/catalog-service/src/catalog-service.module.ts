import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/shared';
import { CatalogServiceController } from './catalog-service.controller';
import { CatalogServiceService } from './catalog-service.service';
import { Artist } from './entities/artist.entity';
import { Album } from './entities/album.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Artist, Album]),
  ],
  controllers: [CatalogServiceController],
  providers: [CatalogServiceService],
})
export class CatalogServiceModule {}
