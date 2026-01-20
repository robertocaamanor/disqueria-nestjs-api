import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlbumDto {
  @ApiProperty({ description: 'The title of the album' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The release year of the album' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'The genre of the album' })
  @IsString()
  genre: string;

  @ApiProperty({ description: 'The price of the album' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'The ID of the artist who created the album' })
  @IsNumber()
  artistId: number;
}
