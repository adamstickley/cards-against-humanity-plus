import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CahCardSetEntity } from '../../../../entities';

@Injectable()
export class CahCardSetService {
  constructor(
    @InjectRepository(CahCardSetEntity)
    private readonly repo: Repository<CahCardSetEntity>,
  ) {}

  findAll() {
    return this.repo.find({
      order: {
        title: 'ASC',
      },
    });
  }

  findOne(id: number): Promise<CahCardSetEntity | null> {
    return this.repo.findOne({ where: { card_set_id: id } });
  }
}
