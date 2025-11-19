import { Controller, Get, Post, Body, Param, Query, Put, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { MahasiswaService } from './Mahasiswa.service';
import { CreateMahasiswaDto } from './dto/create-mahasiswa.dto';
import { UpdateMahasiswaDto } from './dto/update-mahasiswa.dto';

@Controller('mahasiswa')
export class MahasiswaController {
  constructor(private readonly mahasiswaService: MahasiswaService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() createDto: CreateMahasiswaDto) {
    return this.mahasiswaService.create(createDto);
  }

  @Get()
  findAll(
    @Query('departemen') departemen?: string,
    @Query('nip') nip?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const filter: any = {};
    if (departemen) filter.Departemen = departemen;
    if (nip) filter.nip_pembimbing = nip;
    return this.mahasiswaService.findAll(filter, Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mahasiswaService.findById(id);
  }

  @Get('/nim/:nim')
  findByNim(@Param('nim') nim: string) {
    return this.mahasiswaService.findByNim(nim);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateMahasiswaDto) {
    return this.mahasiswaService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mahasiswaService.remove(id);
  }
}
