// dosen/dosen.controller.ts
import { Controller, Get, Query, Param, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { DosenService } from './Dosen.service';
import { CreateDosenDto } from './dto/create-dosen.dto';

@Controller('dosen')
export class DosenController {
  constructor(private readonly dosenService: DosenService) {}

  @Get()
  async findAll(@Query('departemen') departemen: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    const filter = departemen ? { Departemen: departemen } : {};
    return this.dosenService.findAll(filter, Number(page), Number(limit));
  }

  @Get(':nip')
  findOne(@Param('nip') nip: string) {
    return this.dosenService.findByNip(nip);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() createDto: CreateDosenDto) {
    return this.dosenService.create(createDto);
  }
}
