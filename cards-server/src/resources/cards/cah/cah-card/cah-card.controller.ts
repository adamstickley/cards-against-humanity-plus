import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CahCardService } from './cah-card.service';

// TODO: import the rest of the cards from the spreadsheet

@Controller('card')
export class CahCardController {
  constructor(private readonly cahCardsService: CahCardService) {}

  // @Post()
  // create(@Body() createCardDto: CreateCardDto) {
  //   return this.cahCardsService.create(createCardDto);
  // }

  // @Get()
  // findAll() {
  //   return this.cahCardsService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cahCardsService.findOne(id);
  }
}
