import { AttributeRepository } from '../repositories/attribute.repository';
import { Attribute } from '../models/attribute';

export class AttributeService {
  private attributeRepository: AttributeRepository;

  constructor() {
    this.attributeRepository = new AttributeRepository();
  }

  async getAllAttributes(
    page: number = 1,
    perPage: number = 10
  ): Promise<{ items: Attribute[]; total: number }> {
    try {
      return await this.attributeRepository.findAll(page, perPage);
    } catch (error) {
      console.error('Error in AttributeService.getAllAttributes:', error);
      throw error;
    }
  }

  async getAttributeById(id: string): Promise<Attribute | null> {
    try {
      return await this.attributeRepository.findById(id);
    } catch (error) {
      console.error('Error in AttributeService.getAttributeById:', error);
      throw error;
    }
  }

  async getAttributesByAnimeId(animeId: string): Promise<Attribute[]> {
    try {
      return await this.attributeRepository.findByAnimeId(animeId);
    } catch (error) {
      console.error('Error in AttributeService.getAttributesByAnimeId:', error);
      throw error;
    }
  }

  async createAttribute(attributeData: Partial<Attribute>): Promise<Attribute> {
    try {
      return await this.attributeRepository.create(attributeData);
    } catch (error) {
      console.error('Error in AttributeService.createAttribute:', error);
      throw error;
    }
  }

  async updateAttribute(
    id: string,
    attributeData: Partial<Attribute>
  ): Promise<Attribute | null> {
    try {
      return await this.attributeRepository.update(id, attributeData);
    } catch (error) {
      console.error('Error in AttributeService.updateAttribute:', error);
      throw error;
    }
  }

  async deleteAttribute(id: string): Promise<boolean> {
    try {
      return await this.attributeRepository.delete(id);
    } catch (error) {
      console.error('Error in AttributeService.deleteAttribute:', error);
      throw error;
    }
  }
}
