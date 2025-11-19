// src/Mahasiswa/Mahasiswa.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MahasiswaService } from './Mahasiswa.service';
import { CreateMahasiswaDto } from './dto/create-mahasiswa.dto';
import { UpdateMahasiswaDto } from './dto/update-mahasiswa.dto';

@Controller('mahasiswa')
export class MahasiswaController {
  constructor(private readonly mahasiswaService: MahasiswaService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() createDto: CreateMahasiswaDto) {
    // call the public create method on the service (it will pick transaction or fallback)
    return await this.mahasiswaService.create(createDto);
  }

  @Get()
  async findAll(
    @Query('departemen') departemen?: string,
    @Query('nip') nip?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const filter: any = {};
    if (departemen) filter.Departemen = departemen;
    if (nip) filter.nip_pembimbing = nip;
    return await this.mahasiswaService.findAll(filter, Number(page), Number(limit));
  }

  @Get('nim/:nim')
  async findByNim(@Param('nim') nim: string) {
    return await this.mahasiswaService.findByNim(nim);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.mahasiswaService.findById(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id') id: string, @Body() updateDto: UpdateMahasiswaDto) {
    return await this.mahasiswaService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.mahasiswaService.remove(id);
  }
}
