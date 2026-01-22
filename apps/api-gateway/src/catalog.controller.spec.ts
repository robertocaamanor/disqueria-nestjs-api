import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

describe('CatalogController', () => {
  let controller: CatalogController;
  let client: ClientProxy;

  const mockClient = {
    send: jest.fn(),
  };

  const mockArtist = {
    id: 1,
    name: 'The Beatles',
    country: 'United Kingdom',
  };

  const mockAlbum = {
    id: 1,
    title: 'Abbey Road',
    year: 1969,
    genre: 'Rock',
    price: 19.99,
    artistId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: 'CATALOG_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    client = module.get<ClientProxy>('CATALOG_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getArtists', () => {
    it('should return an array of artists', () => {
      const artists = [mockArtist];
      mockClient.send.mockReturnValue(of(artists));

      const result = controller.getArtists();

      result.subscribe((data) => {
        expect(data).toEqual(artists);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'get_artists' }, {});
    });

    it('should handle empty artist list', () => {
      mockClient.send.mockReturnValue(of([]));

      const result = controller.getArtists();

      result.subscribe((data) => {
        expect(data).toEqual([]);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'get_artists' }, {});
    });

    it('should handle service errors', () => {
      const error = new Error('Service error');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.getArtists();

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Service error');
        },
      });
    });
  });

  describe('createArtist', () => {
    it('should create and return an artist', () => {
      const createArtistDto = { name: 'Pink Floyd', country: 'UK' };
      mockClient.send.mockReturnValue(of(mockArtist));

      const result = controller.createArtist(createArtistDto);

      result.subscribe((data) => {
        expect(data).toEqual(mockArtist);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_artist' }, createArtistDto);
    });

    it('should create artist without country', () => {
      const createArtistDto = { name: 'Unknown Artist' };
      mockClient.send.mockReturnValue(of({ ...mockArtist, country: null }));

      const result = controller.createArtist(createArtistDto);

      result.subscribe((data) => {
        expect(data.country).toBeNull();
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_artist' }, createArtistDto);
    });
  });

  describe('getAlbums', () => {
    it('should return an array of albums', () => {
      const albums = [mockAlbum];
      mockClient.send.mockReturnValue(of(albums));

      const result = controller.getAlbums();

      result.subscribe((data) => {
        expect(data).toEqual(albums);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'get_albums' }, {});
    });

    it('should handle empty album list', () => {
      mockClient.send.mockReturnValue(of([]));

      const result = controller.getAlbums();

      result.subscribe((data) => {
        expect(data).toEqual([]);
      });
    });
  });

  describe('createAlbum', () => {
    it('should create and return an album', () => {
      const createAlbumDto = {
        title: 'Abbey Road',
        year: 1969,
        genre: 'Rock',
        price: 19.99,
        artistId: 1,
      };
      mockClient.send.mockReturnValue(of(mockAlbum));

      const result = controller.createAlbum(createAlbumDto);

      result.subscribe((data) => {
        expect(data).toEqual(mockAlbum);
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'create_album' }, createAlbumDto);
    });

    it('should handle album creation errors', () => {
      const createAlbumDto = {
        title: 'Test Album',
        year: 2020,
        genre: 'Pop',
        price: 15.99,
        artistId: 999,
      };
      const error = new Error('Artist not found');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.createAlbum(createAlbumDto);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Artist not found');
        },
      });
    });
  });

  describe('updateArtist', () => {
    it('should update and return an artist', () => {
      const updateArtistDto = { name: 'The Beatles - Updated' };
      const updatedArtist = { ...mockArtist, name: 'The Beatles - Updated' };
      mockClient.send.mockReturnValue(of(updatedArtist));

      const result = controller.updateArtist(1, updateArtistDto);

      result.subscribe((data) => {
        expect(data).toEqual(updatedArtist);
      });
      expect(client.send).toHaveBeenCalledWith(
        { cmd: 'update_artist' },
        { id: 1, data: updateArtistDto }
      );
    });

    it('should handle artist not found', () => {
      const updateArtistDto = { name: 'Non-existent' };
      mockClient.send.mockReturnValue(of(null));

      const result = controller.updateArtist(999, updateArtistDto);

      result.subscribe((data) => {
        expect(data).toBeNull();
      });
    });
  });

  describe('deleteArtist', () => {
    it('should delete an artist', () => {
      mockClient.send.mockReturnValue(of(undefined));

      const result = controller.deleteArtist(1);

      result.subscribe((data) => {
        expect(data).toBeUndefined();
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'delete_artist' }, 1);
    });

    it('should handle deletion errors', () => {
      const error = new Error('Deletion failed');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.deleteArtist(1);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Deletion failed');
        },
      });
    });
  });

  describe('updateAlbum', () => {
    it('should update and return an album', () => {
      const updateAlbumDto = { title: 'Abbey Road - Remastered', price: 24.99 };
      const updatedAlbum = { ...mockAlbum, ...updateAlbumDto };
      mockClient.send.mockReturnValue(of(updatedAlbum));

      const result = controller.updateAlbum(1, updateAlbumDto);

      result.subscribe((data) => {
        expect(data).toEqual(updatedAlbum);
      });
      expect(client.send).toHaveBeenCalledWith(
        { cmd: 'update_album' },
        { id: 1, data: updateAlbumDto }
      );
    });

    it('should handle album not found', () => {
      const updateAlbumDto = { title: 'Non-existent' };
      mockClient.send.mockReturnValue(of(null));

      const result = controller.updateAlbum(999, updateAlbumDto);

      result.subscribe((data) => {
        expect(data).toBeNull();
      });
    });
  });

  describe('deleteAlbum', () => {
    it('should delete an album', () => {
      mockClient.send.mockReturnValue(of(undefined));

      const result = controller.deleteAlbum(1);

      result.subscribe((data) => {
        expect(data).toBeUndefined();
      });
      expect(client.send).toHaveBeenCalledWith({ cmd: 'delete_album' }, 1);
    });

    it('should handle deletion errors', () => {
      const error = new Error('Delete failed');
      mockClient.send.mockReturnValue(throwError(() => error));

      const result = controller.deleteAlbum(1);

      result.subscribe({
        error: (err) => {
          expect(err.message).toBe('Delete failed');
        },
      });
    });
  });
});
