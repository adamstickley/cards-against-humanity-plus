import { Controller, Get, Param } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // @Post()
  // create(@Body() createGameDto: CreateGameDto) {
  //   return this.gameService.create(createGameDto);
  // }

  @Get()
  findAll() {
    return this.gameService.findAll();
  }

  @Get(':gameName')
  findOne(@Param('gameName') gameName: string) {
    return this.gameService.findOne(gameName);
  }

  // @Patch(':gameId')
  // update(@Param('gameId') gameId: string, @Body() updateGameDto: UpdateGameDto) {
  //   return this.gameService.update(+gameId, updateGameDto);
  // }
  //
  // @Delete(':gameId')
  // remove(@Param('gameId') gameId: string) {
  //   return this.gameService.remove(+gameId);
  // }
}
