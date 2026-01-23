import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAlbumDto {
  @ApiProperty({ description: 'The title of the album' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The release year of the album' })
  @IsNumber()
  @Type(() => Number)
  year: number;

  @ApiProperty({ description: 'The genre of the album' })
  @IsString()
  genre: string;

  @ApiProperty({ description: 'The price of the album' })
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'The ID of the artist who created the album' })
  @IsNumber()
  @Type(() => Number)
  artistId: number;

  @ApiProperty({ description: 'The stock quantity of the album' })
  @IsNumber()
  @Type(() => Number)
  stock: number;

  @ApiProperty({ description: 'The cover image URL of the album', required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;
}
