import { Test, TestingModule } from '@nestjs/testing';
import { CatalogServiceController } from './catalog-service.controller';
import { CatalogServiceService } from './catalog-service.service';
import { Artist } from './entities/artist.entity';
import { Album } from './entities/album.entity';

describe('CatalogServiceController', () => {
  let controller: CatalogServiceController;
  let service: CatalogServiceService;

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

  const mockCatalogService = {
    findAllArtists: jest.fn(),
    createArtist: jest.fn(),
    findAllAlbums: jest.fn(),
    createAlbum: jest.fn(),
    updateArtist: jest.fn(),
    deleteArtist: jest.fn(),
    updateAlbum: jest.fn(),
    deleteAlbum: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogServiceController],
      providers: [
        {
          provide: CatalogServiceService,
          useValue: mockCatalogService,
        },
      ],
    }).compile();

    controller = module.get<CatalogServiceController>(CatalogServiceController);
    service = module.get<CatalogServiceService>(CatalogServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArtists', () => {
    it('should return an array of artists', async () => {
      const artists = [mockArtist];
      mockCatalogService.findAllArtists.mockResolvedValue(artists);

      const result = await controller.getArtists();

      expect(result).toEqual(artists);
      expect(service.findAllArtists).toHaveBeenCalled();
      expect(service.findAllArtists).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no artists exist', async () => {
      mockCatalogService.findAllArtists.mockResolvedValue([]);

      const result = await controller.getArtists();

      expect(result).toEqual([]);
      expect(service.findAllArtists).toHaveBeenCalled();
    });

    it('should handle errors when fetching artists', async () => {
      const error = new Error('Database error');
      mockCatalogService.findAllArtists.mockRejectedValue(error);

      await expect(controller.getArtists()).rejects.toThrow('Database error');
      expect(service.findAllArtists).toHaveBeenCalled();
    });
  });

  describe('createArtist', () => {
    it('should create and return an artist', async () => {
      const createArtistDto = { name: 'The Beatles', country: 'United Kingdom' };
      mockCatalogService.createArtist.mockResolvedValue(mockArtist);

      const result = await controller.createArtist(createArtistDto);

      expect(result).toEqual(mockArtist);
      expect(service.createArtist).toHaveBeenCalledWith(createArtistDto);
      expect(service.createArtist).toHaveBeenCalledTimes(1);
    });

    it('should create an artist without country', async () => {
      const createArtistDto = { name: 'Pink Floyd' };
      const artistWithoutCountry = { ...mockArtist, id: 2, name: 'Pink Floyd', country: null };
      mockCatalogService.createArtist.mockResolvedValue(artistWithoutCountry);

      const result = await controller.createArtist(createArtistDto);

      expect(result).toEqual(artistWithoutCountry);
      expect(service.createArtist).toHaveBeenCalledWith(createArtistDto);
    });

    it('should handle errors when creating an artist', async () => {
      const createArtistDto = { name: 'The Beatles', country: 'United Kingdom' };
      const error = new Error('Creation failed');
      mockCatalogService.createArtist.mockRejectedValue(error);

      await expect(controller.createArtist(createArtistDto)).rejects.toThrow('Creation failed');
      expect(service.createArtist).toHaveBeenCalledWith(createArtistDto);
    });
  });

  describe('getAlbums', () => {
    it('should return an array of albums', async () => {
      const albums = [mockAlbum];
      mockCatalogService.findAllAlbums.mockResolvedValue(albums);

      const result = await controller.getAlbums();

      expect(result).toEqual(albums);
      expect(service.findAllAlbums).toHaveBeenCalled();
      expect(service.findAllAlbums).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no albums exist', async () => {
      mockCatalogService.findAllAlbums.mockResolvedValue([]);

      const result = await controller.getAlbums();

      expect(result).toEqual([]);
      expect(service.findAllAlbums).toHaveBeenCalled();
    });

    it('should handle errors when fetching albums', async () => {
      const error = new Error('Database error');
      mockCatalogService.findAllAlbums.mockRejectedValue(error);

      await expect(controller.getAlbums()).rejects.toThrow('Database error');
      expect(service.findAllAlbums).toHaveBeenCalled();
    });
  });

  describe('createAlbum', () => {
    it('should create and return an album', async () => {
      const createAlbumDto = {
        title: 'Abbey Road',
        year: 1969,
        genre: 'Rock',
        price: 19.99,
        artistId: 1,
      };
      mockCatalogService.createAlbum.mockResolvedValue(mockAlbum);

      const result = await controller.createAlbum(createAlbumDto);

      expect(result).toEqual(mockAlbum);
      expect(service.createAlbum).toHaveBeenCalledWith(createAlbumDto);
      expect(service.createAlbum).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when artist is not found', async () => {
      const createAlbumDto = {
        title: 'Abbey Road',
        year: 1969,
        genre: 'Rock',
        price: 19.99,
        artistId: 999,
      };
      const error = new Error('Artist not found');
      mockCatalogService.createAlbum.mockRejectedValue(error);

      await expect(controller.createAlbum(createAlbumDto)).rejects.toThrow('Artist not found');
      expect(service.createAlbum).toHaveBeenCalledWith(createAlbumDto);
    });

    it('should handle errors when creating an album', async () => {
      const createAlbumDto = {
        title: 'Abbey Road',
        year: 1969,
        genre: 'Rock',
        price: 19.99,
        artistId: 1,
      };
      const error = new Error('Creation failed');
      mockCatalogService.createAlbum.mockRejectedValue(error);

      await expect(controller.createAlbum(createAlbumDto)).rejects.toThrow('Creation failed');
      expect(service.createAlbum).toHaveBeenCalledWith(createAlbumDto);
    });
  });

  describe('updateArtist', () => {
    it('should update and return an artist', async () => {
      const updateData = { id: 1, data: { name: 'The Beatles - Updated' } };
      const updatedArtist = { ...mockArtist, name: 'The Beatles - Updated' };
      mockCatalogService.updateArtist.mockResolvedValue(updatedArtist);

      const result = await controller.updateArtist(updateData);

      expect(result).toEqual(updatedArtist);
      expect(service.updateArtist).toHaveBeenCalledWith(1, { name: 'The Beatles - Updated' });
      expect(service.updateArtist).toHaveBeenCalledTimes(1);
    });

    it('should update artist country', async () => {
      const updateData = { id: 1, data: { country: 'UK' } };
      const updatedArtist = { ...mockArtist, country: 'UK' };
      mockCatalogService.updateArtist.mockResolvedValue(updatedArtist);

      const result = await controller.updateArtist(updateData);

      expect(result).toEqual(updatedArtist);
      expect(service.updateArtist).toHaveBeenCalledWith(1, { country: 'UK' });
    });

    it('should return null when artist is not found', async () => {
      const updateData = { id: 999, data: { name: 'Non-existent' } };
      mockCatalogService.updateArtist.mockResolvedValue(null);

      const result = await controller.updateArtist(updateData);

      expect(result).toBeNull();
      expect(service.updateArtist).toHaveBeenCalledWith(999, { name: 'Non-existent' });
    });

    it('should handle errors when updating an artist', async () => {
      const updateData = { id: 1, data: { name: 'The Beatles' } };
      const error = new Error('Update failed');
      mockCatalogService.updateArtist.mockRejectedValue(error);

      await expect(controller.updateArtist(updateData)).rejects.toThrow('Update failed');
      expect(service.updateArtist).toHaveBeenCalledWith(1, { name: 'The Beatles' });
    });
  });

  describe('deleteArtist', () => {
    it('should delete an artist', async () => {
      mockCatalogService.deleteArtist.mockResolvedValue(undefined);

      const result = await controller.deleteArtist(1);

      expect(result).toBeUndefined();
      expect(service.deleteArtist).toHaveBeenCalledWith(1);
      expect(service.deleteArtist).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent artist', async () => {
      mockCatalogService.deleteArtist.mockResolvedValue(undefined);

      const result = await controller.deleteArtist(999);

      expect(result).toBeUndefined();
      expect(service.deleteArtist).toHaveBeenCalledWith(999);
    });

    it('should handle errors when deleting an artist', async () => {
      const error = new Error('Deletion failed');
      mockCatalogService.deleteArtist.mockRejectedValue(error);

      await expect(controller.deleteArtist(1)).rejects.toThrow('Deletion failed');
      expect(service.deleteArtist).toHaveBeenCalledWith(1);
    });
  });

  describe('updateAlbum', () => {
    it('should update and return an album', async () => {
      const updateData = { id: 1, data: { title: 'Abbey Road - Remastered' } };
      const updatedAlbum = { ...mockAlbum, title: 'Abbey Road - Remastered' };
      mockCatalogService.updateAlbum.mockResolvedValue(updatedAlbum);

      const result = await controller.updateAlbum(updateData);

      expect(result).toEqual(updatedAlbum);
      expect(service.updateAlbum).toHaveBeenCalledWith(1, { title: 'Abbey Road - Remastered' });
      expect(service.updateAlbum).toHaveBeenCalledTimes(1);
    });

    it('should update album price', async () => {
      const updateData = { id: 1, data: { price: 24.99 } };
      const updatedAlbum = { ...mockAlbum, price: 24.99 };
      mockCatalogService.updateAlbum.mockResolvedValue(updatedAlbum);

      const result = await controller.updateAlbum(updateData);

      expect(result).toEqual(updatedAlbum);
      expect(service.updateAlbum).toHaveBeenCalledWith(1, { price: 24.99 });
    });

    it('should update multiple album properties', async () => {
      const updateData = { id: 1, data: { year: 1970, genre: 'Classic Rock' } };
      const updatedAlbum = { ...mockAlbum, year: 1970, genre: 'Classic Rock' };
      mockCatalogService.updateAlbum.mockResolvedValue(updatedAlbum);

      const result = await controller.updateAlbum(updateData);

      expect(result).toEqual(updatedAlbum);
      expect(service.updateAlbum).toHaveBeenCalledWith(1, { year: 1970, genre: 'Classic Rock' });
    });

    it('should return null when album is not found', async () => {
      const updateData = { id: 999, data: { title: 'Non-existent' } };
      mockCatalogService.updateAlbum.mockResolvedValue(null);

      const result = await controller.updateAlbum(updateData);

      expect(result).toBeNull();
      expect(service.updateAlbum).toHaveBeenCalledWith(999, { title: 'Non-existent' });
    });

    it('should handle errors when updating an album', async () => {
      const updateData = { id: 1, data: { title: 'Abbey Road' } };
      const error = new Error('Update failed');
      mockCatalogService.updateAlbum.mockRejectedValue(error);

      await expect(controller.updateAlbum(updateData)).rejects.toThrow('Update failed');
      expect(service.updateAlbum).toHaveBeenCalledWith(1, { title: 'Abbey Road' });
    });
  });

  describe('deleteAlbum', () => {
    it('should delete an album', async () => {
      mockCatalogService.deleteAlbum.mockResolvedValue(undefined);

      const result = await controller.deleteAlbum(1);

      expect(result).toBeUndefined();
      expect(service.deleteAlbum).toHaveBeenCalledWith(1);
      expect(service.deleteAlbum).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent album', async () => {
      mockCatalogService.deleteAlbum.mockResolvedValue(undefined);

      const result = await controller.deleteAlbum(999);

      expect(result).toBeUndefined();
      expect(service.deleteAlbum).toHaveBeenCalledWith(999);
    });

    it('should handle errors when deleting an album', async () => {
      const error = new Error('Deletion failed');
      mockCatalogService.deleteAlbum.mockRejectedValue(error);

      await expect(controller.deleteAlbum(1)).rejects.toThrow('Deletion failed');
      expect(service.deleteAlbum).toHaveBeenCalledWith(1);
    });
  });
});
