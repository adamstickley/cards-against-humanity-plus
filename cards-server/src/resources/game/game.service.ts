import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from '../../entities';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameEntity) private readonly repo: Repository<GameEntity>,
  ) {}

  // create(createGameDto: CreateGameDto) {
  //   return 'This action adds a new game';
  // }

  findAll() {
    return this.repo.find({
      where: {
        active: true,
      },
    });
  }

  findOne(gameName: string) {
    return this.repo.findOne({ where: { slug: gameName } });
  }

  // update(id: number, updateGameDto: UpdateGameDto) {
  //   return `This action updates a #${id} game`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} game`;
  // }
}
