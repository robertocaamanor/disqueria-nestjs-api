import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CatalogServiceService } from './catalog-service.service';

@Controller()
export class CatalogServiceController {
  constructor(private readonly catalogService: CatalogServiceService) { }

  @MessagePattern({ cmd: 'get_artists' })
  async getArtists() {
    return this.catalogService.findAllArtists();
  }

  @MessagePattern({ cmd: 'create_artist' })
  async createArtist(@Payload() data: any) {
    return this.catalogService.createArtist(data);
  }

  @MessagePattern({ cmd: 'get_albums' })
  async getAlbums() {
    return this.catalogService.findAllAlbums();
  }

  @MessagePattern({ cmd: 'create_album' })
  async createAlbum(@Payload() data: any) {
    return this.catalogService.createAlbum(data);
  }

  @MessagePattern({ cmd: 'update_artist' })
  async updateArtist(@Payload() data: { id: number; data: any }) {
    return this.catalogService.updateArtist(data.id, data.data);
  }

  @MessagePattern({ cmd: 'delete_artist' })
  async deleteArtist(@Payload() id: number) {
    return this.catalogService.deleteArtist(id);
  }

  @MessagePattern({ cmd: 'update_album' })
  async updateAlbum(@Payload() data: { id: number; data: any }) {
    return this.catalogService.updateAlbum(data.id, data.data);
  }

  @MessagePattern({ cmd: 'delete_album' })
  async deleteAlbum(@Payload() id: number) {
    return this.catalogService.deleteAlbum(id);
  }

  @MessagePattern({ cmd: 'decrease_stock' })
  async decreaseStock(@Payload() data: { id: number; quantity: number }) {
    return this.catalogService.decreaseStock(data.id, data.quantity);
  }
}
