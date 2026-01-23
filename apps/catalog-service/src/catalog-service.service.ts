import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { Album } from './entities/album.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CatalogServiceService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
  ) { }

  async findAllArtists(): Promise<Artist[]> {
    return this.artistRepository.find({ relations: ['albums'] });
  }

  async createArtist(data: Partial<Artist>): Promise<Artist> {
    const artist = this.artistRepository.create(data);
    return this.artistRepository.save(artist);
  }

  async findAllAlbums(): Promise<Album[]> {
    return this.albumRepository.find({ relations: ['artist'] });
  }

  async createAlbum(data: Partial<Album> & { artistId: number }): Promise<Album> {
    const { artistId, ...albumData } = data;
    const artist = await this.artistRepository.findOne({ where: { id: artistId } });
    if (!artist) {
      throw new Error('Artist not found');
    }
    const album = this.albumRepository.create({ ...albumData, artist });
    return this.albumRepository.save(album);
  }

  async updateArtist(id: number, data: Partial<Artist>): Promise<Artist | null> {
    await this.artistRepository.update(id, data);
    return this.artistRepository.findOne({ where: { id } });
  }

  async deleteArtist(id: number): Promise<{ success: boolean; message: string }> {
    const artist = await this.artistRepository.findOne({ 
      where: { id },
      relations: ['albums']
    });
    if (!artist) {
      throw new RpcException({
        statusCode: 404,
        message: 'Artist not found'
      });
    }
    
    // TypeORM con onDelete: 'CASCADE' en la relación eliminará los álbumes automáticamente
    await this.artistRepository.remove(artist);
    return { success: true, message: 'Artist deleted successfully' };
  }

  async updateAlbum(id: number, data: Partial<Album> & { artistId?: number }): Promise<Album | null> {
    const album = await this.albumRepository.findOne({ where: { id }, relations: ['artist'] });
    if (!album) {
      throw new RpcException({
        statusCode: 404,
        message: 'Album not found'
      });
    }

    const { artistId, ...albumData } = data;
    
    // Update artist relationship if artistId is provided
    if (artistId !== undefined) {
      const artist = await this.artistRepository.findOne({ where: { id: artistId } });
      if (!artist) {
        throw new RpcException({
          statusCode: 404,
          message: 'Artist not found'
        });
      }
      album.artist = artist;
    }

    // Update other album properties
    Object.assign(album, albumData);
    
    return this.albumRepository.save(album);
  }

  async deleteAlbum(id: number): Promise<{ success: boolean; message: string }> {
    const album = await this.albumRepository.findOne({ where: { id } });
    if (!album) {
      throw new RpcException({
        statusCode: 404,
        message: 'Album not found'
      });
    }
    await this.albumRepository.delete(id);
    return { success: true, message: 'Album deleted successfully' };
  }

  async decreaseStock(id: number, quantity: number): Promise<Album> {
    const album = await this.albumRepository.findOne({ where: { id } });
    if (!album) {
      throw new RpcException({
        statusCode: 404,
        message: 'Album not found'
      });
    }

    if (album.stock < quantity) {
      throw new RpcException({
        statusCode: 400,
        message: `Insufficient stock for album ${album.title}. Available: ${album.stock}`
      });
    }

    album.stock -= quantity;
    return this.albumRepository.save(album);
  }
}
