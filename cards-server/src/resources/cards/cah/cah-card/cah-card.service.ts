import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahCardEntity } from '../../../../entities';

@Injectable()
export class CahCardService {
  constructor(
    @InjectRepository(CahCardEntity)
    private readonly repo: Repository<CahCardEntity>,
  ) {}
  findOne(id: number): Promise<CahCardEntity | null> {
    return this.repo.findOne({ where: { card_id: id } });
  }
}
