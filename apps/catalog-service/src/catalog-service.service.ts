import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { Album } from './entities/album.entity';

@Injectable()
export class CatalogServiceService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
  ) {}

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

  async deleteArtist(id: number): Promise<void> {
    await this.artistRepository.delete(id);
  }

  async updateAlbum(id: number, data: Partial<Album>): Promise<Album | null> {
    await this.albumRepository.update(id, data);
    return this.albumRepository.findOne({ where: { id } });
  }

  async deleteAlbum(id: number): Promise<void> {
    await this.albumRepository.delete(id);
  }
}
