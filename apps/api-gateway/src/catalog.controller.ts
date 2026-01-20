import { Controller, Get, Post, Body, Inject, UseGuards, Put, Delete, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateArtistDto, CreateAlbumDto, UpdateArtistDto, UpdateAlbumDto } from '@app/shared';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(
    @Inject('CATALOG_SERVICE') private client: ClientProxy,
  ) {}

  @Get('artists')
  @ApiOperation({ summary: 'Get all artists' })
  getArtists() {
    return this.client.send({ cmd: 'get_artists' }, {});
  }

  @Post('artists')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an artist (Protected)' })
  createArtist(@Body() data: CreateArtistDto) {
    return this.client.send({ cmd: 'create_artist' }, data);
  }

  @Get('albums')
  @ApiOperation({ summary: 'Get all albums' })
  getAlbums() {
    return this.client.send({ cmd: 'get_albums' }, {});
  }

  @Post('albums')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an album (Protected)' })
  createAlbum(@Body() data: CreateAlbumDto) {
    return this.client.send({ cmd: 'create_album' }, data);
  }

  @Put('artists/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an artist (Protected)' })
  updateArtist(@Param('id') id: number, @Body() data: UpdateArtistDto) {
    return this.client.send({ cmd: 'update_artist' }, { id, data });
  }

  @Delete('artists/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an artist (Protected)' })
  deleteArtist(@Param('id') id: number) {
    return this.client.send({ cmd: 'delete_artist' }, id);
  }

  @Put('albums/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an album (Protected)' })
  updateAlbum(@Param('id') id: number, @Body() data: UpdateAlbumDto) {
    return this.client.send({ cmd: 'update_album' }, { id, data });
  }

  @Delete('albums/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an album (Protected)' })
  deleteAlbum(@Param('id') id: number) {
    return this.client.send({ cmd: 'delete_album' }, id);
  }
}
