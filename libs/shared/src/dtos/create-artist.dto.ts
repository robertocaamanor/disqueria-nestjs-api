import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty({ description: 'The name of the artist' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'The country of the artist' })
  @IsString()
  @IsOptional()
  country?: string;
}
