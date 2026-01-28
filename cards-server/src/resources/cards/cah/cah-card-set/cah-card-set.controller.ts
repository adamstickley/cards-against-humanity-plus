import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CahCardSetService } from './cah-card-set.service';

@Controller('set')
export class CahCardSetController {
  constructor(private readonly cahCardSetService: CahCardSetService) {}

  // @Post()
  // create(@Body() createCardDto: CreateCardDto) {
  //   return this.cahCardSetService.create(createCardDto);
  // }

  @Get()
  findAll() {
    return this.cahCardSetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cahCardSetService.findOne(id);
  }
}
