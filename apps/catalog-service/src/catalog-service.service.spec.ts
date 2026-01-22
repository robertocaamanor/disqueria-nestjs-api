import { Test, TestingModule } from '@nestjs/testing';
import { CatalogServiceService } from './catalog-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { Album } from './entities/album.entity';

describe('CatalogServiceService', () => {
  let service: CatalogServiceService;
  let artistRepository: Repository<Artist>;
  let albumRepository: Repository<Album>;

  const mockArtist: Artist = {
    id: 1,
    name: 'The Beatles',
    country: 'United Kingdom',
    albums: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAlbum: Album = {
    id: 1,
    title: 'Abbey Road',
    year: 1969,
    genre: 'Rock',
    price: 19.99,
    artist: mockArtist,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockArtistRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAlbumRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogServiceService,
        {
          provide: getRepositoryToken(Artist),
          useValue: mockArtistRepository,
        },
        {
          provide: getRepositoryToken(Album),
          useValue: mockAlbumRepository,
        },
      ],
    }).compile();

    service = module.get<CatalogServiceService>(CatalogServiceService);
    artistRepository = module.get<Repository<Artist>>(getRepositoryToken(Artist));
    albumRepository = module.get<Repository<Album>>(getRepositoryToken(Album));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllArtists', () => {
    it('should return an array of artists with albums', async () => {
      const artists = [mockArtist, { ...mockArtist, id: 2, name: 'Pink Floyd' }];
      mockArtistRepository.find.mockResolvedValue(artists);

      const result = await service.findAllArtists();

      expect(result).toEqual(artists);
      expect(artistRepository.find).toHaveBeenCalledWith({ relations: ['albums'] });
      expect(artistRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no artists exist', async () => {
      mockArtistRepository.find.mockResolvedValue([]);

      const result = await service.findAllArtists();

      expect(result).toEqual([]);
      expect(artistRepository.find).toHaveBeenCalledWith({ relations: ['albums'] });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection error');
      mockArtistRepository.find.mockRejectedValue(error);

      await expect(service.findAllArtists()).rejects.toThrow('Database connection error');
      expect(artistRepository.find).toHaveBeenCalled();
    });
  });

  describe('createArtist', () => {
    it('should create and return an artist', async () => {
      const artistData = { name: 'The Beatles', country: 'United Kingdom' };
      mockArtistRepository.create.mockReturnValue(mockArtist);
      mockArtistRepository.save.mockResolvedValue(mockArtist);

      const result = await service.createArtist(artistData);

      expect(result).toEqual(mockArtist);
      expect(artistRepository.create).toHaveBeenCalledWith(artistData);
      expect(artistRepository.save).toHaveBeenCalledWith(mockArtist);
    });

    it('should create an artist without country', async () => {
      const artistData = { name: 'Unknown Artist' };
      const artistWithoutCountry = { ...mockArtist, country: null };
      mockArtistRepository.create.mockReturnValue(artistWithoutCountry);
      mockArtistRepository.save.mockResolvedValue(artistWithoutCountry);

      const result = await service.createArtist(artistData);

      expect(result.country).toBeNull();
      expect(artistRepository.create).toHaveBeenCalledWith(artistData);
      expect(artistRepository.save).toHaveBeenCalledWith(artistWithoutCountry);
    });

    it('should handle save errors', async () => {
      const artistData = { name: 'Error Artist' };
      const error = new Error('Save failed');
      mockArtistRepository.create.mockReturnValue(mockArtist);
      mockArtistRepository.save.mockRejectedValue(error);

      await expect(service.createArtist(artistData)).rejects.toThrow('Save failed');
      expect(artistRepository.create).toHaveBeenCalledWith(artistData);
    });
  });

  describe('findAllAlbums', () => {
    it('should return an array of albums with artist relations', async () => {
      const albums = [mockAlbum, { ...mockAlbum, id: 2, title: 'Let It Be' }];
      mockAlbumRepository.find.mockResolvedValue(albums);

      const result = await service.findAllAlbums();

      expect(result).toEqual(albums);
      expect(albumRepository.find).toHaveBeenCalledWith({ relations: ['artist'] });
      expect(albumRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no albums exist', async () => {
      mockAlbumRepository.find.mockResolvedValue([]);

      const result = await service.findAllAlbums();

      expect(result).toEqual([]);
      expect(albumRepository.find).toHaveBeenCalledWith({ relations: ['artist'] });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection error');
      mockAlbumRepository.find.mockRejectedValue(error);

      await expect(service.findAllAlbums()).rejects.toThrow('Database connection error');
      expect(albumRepository.find).toHaveBeenCalled();
    });
  });

  describe('createAlbum', () => {
    it('should create and return an album when artist exists', async () => {
      const albumData = {
        title: 'Abbey Road',
        year: 1969,
        genre: 'Rock',
        price: 19.99,
        artistId: 1,
      };
      mockArtistRepository.findOne.mockResolvedValue(mockArtist);
      mockAlbumRepository.create.mockReturnValue(mockAlbum);
      mockAlbumRepository.save.mockResolvedValue(mockAlbum);

      const result = await service.createAlbum(albumData);

      expect(result).toEqual(mockAlbum);
      expect(artistRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(albumRepository.create).toHaveBeenCalledWith({
        title: 'Abbey Road',
        year: 1969,
        genre: 'Rock',
        price: 19.99,
        artist: mockArtist,
      });
      expect(albumRepository.save).toHaveBeenCalledWith(mockAlbum);
    });

    it('should throw error when artist is not found', async () => {
      const albumData = {
        title: 'Album Without Artist',
        year: 2020,
        genre: 'Pop',
        price: 15.99,
        artistId: 999,
      };
      mockArtistRepository.findOne.mockResolvedValue(null);

      await expect(service.createAlbum(albumData)).rejects.toThrow('Artist not found');
      expect(artistRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(albumRepository.create).not.toHaveBeenCalled();
      expect(albumRepository.save).not.toHaveBeenCalled();
    });

    it('should handle save errors', async () => {
      const albumData = {
        title: 'Error Album',
        year: 2020,
        genre: 'Rock',
        price: 20.0,
        artistId: 1,
      };
      const error = new Error('Save failed');
      mockArtistRepository.findOne.mockResolvedValue(mockArtist);
      mockAlbumRepository.create.mockReturnValue(mockAlbum);
      mockAlbumRepository.save.mockRejectedValue(error);

      await expect(service.createAlbum(albumData)).rejects.toThrow('Save failed');
      expect(artistRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('updateArtist', () => {
    it('should update and return an artist', async () => {
      const updateData = { name: 'The Beatles - Updated' };
      const updatedArtist = { ...mockArtist, name: 'The Beatles - Updated' };
      mockArtistRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      mockArtistRepository.findOne.mockResolvedValue(updatedArtist);

      const result = await service.updateArtist(1, updateData);

      expect(result).toEqual(updatedArtist);
      expect(artistRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(artistRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when artist is not found', async () => {
      const updateData = { name: 'Non-existent' };
      mockArtistRepository.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });
      mockArtistRepository.findOne.mockResolvedValue(null);

      const result = await service.updateArtist(999, updateData);

      expect(result).toBeNull();
      expect(artistRepository.update).toHaveBeenCalledWith(999, updateData);
      expect(artistRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });

    it('should update partial artist data', async () => {
      const updateData = { country: 'UK' };
      const updatedArtist = { ...mockArtist, country: 'UK' };
      mockArtistRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      mockArtistRepository.findOne.mockResolvedValue(updatedArtist);

      const result = await service.updateArtist(1, updateData);

      expect(result).toEqual(updatedArtist);
      expect(artistRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle update errors', async () => {
      const updateData = { name: 'Error' };
      const error = new Error('Update failed');
      mockArtistRepository.update.mockRejectedValue(error);

      await expect(service.updateArtist(1, updateData)).rejects.toThrow('Update failed');
      expect(artistRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteArtist', () => {
    it('should delete an artist', async () => {
      mockArtistRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.deleteArtist(1);

      expect(artistRepository.delete).toHaveBeenCalledWith(1);
      expect(artistRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent artist', async () => {
      mockArtistRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await service.deleteArtist(999);

      expect(artistRepository.delete).toHaveBeenCalledWith(999);
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockArtistRepository.delete.mockRejectedValue(error);

      await expect(service.deleteArtist(1)).rejects.toThrow('Delete failed');
      expect(artistRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('updateAlbum', () => {
    it('should update and return an album', async () => {
      const updateData = { title: 'Abbey Road - Remastered', price: 24.99 };
      const updatedAlbum = { ...mockAlbum, ...updateData };
      mockAlbumRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      mockAlbumRepository.findOne.mockResolvedValue(updatedAlbum);

      const result = await service.updateAlbum(1, updateData);

      expect(result).toEqual(updatedAlbum);
      expect(albumRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(albumRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null when album is not found', async () => {
      const updateData = { title: 'Non-existent' };
      mockAlbumRepository.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });
      mockAlbumRepository.findOne.mockResolvedValue(null);

      const result = await service.updateAlbum(999, updateData);

      expect(result).toBeNull();
      expect(albumRepository.update).toHaveBeenCalledWith(999, updateData);
      expect(albumRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });

    it('should update single album property', async () => {
      const updateData = { price: 29.99 };
      const updatedAlbum = { ...mockAlbum, price: 29.99 };
      mockAlbumRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      mockAlbumRepository.findOne.mockResolvedValue(updatedAlbum);

      const result = await service.updateAlbum(1, updateData);

      expect(result.price).toBe(29.99);
      expect(albumRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle update errors', async () => {
      const updateData = { title: 'Error' };
      const error = new Error('Update failed');
      mockAlbumRepository.update.mockRejectedValue(error);

      await expect(service.updateAlbum(1, updateData)).rejects.toThrow('Update failed');
      expect(albumRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteAlbum', () => {
    it('should delete an album', async () => {
      mockAlbumRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.deleteAlbum(1);

      expect(albumRepository.delete).toHaveBeenCalledWith(1);
      expect(albumRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent album', async () => {
      mockAlbumRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await service.deleteAlbum(999);

      expect(albumRepository.delete).toHaveBeenCalledWith(999);
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockAlbumRepository.delete.mockRejectedValue(error);

      await expect(service.deleteAlbum(1)).rejects.toThrow('Delete failed');
      expect(albumRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
