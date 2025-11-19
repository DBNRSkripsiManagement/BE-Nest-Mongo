import { Controller, Get, Query, Param, Post, Delete, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { DosenService } from './Dosen.service';
import { CreateDosenDto } from './dto/create-dosen.dto';

@Controller('dosen')
export class DosenController {
  constructor(private readonly dosenService: DosenService) {}

  /** -----------------------------
   *  GET /dosen
   *  (alias /getAll)
   * -------------------------------- */
  @Get()
  async findAll(
    @Query('departemen') departemen: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const filter = departemen ? { Departemen: departemen } : {};
    return this.dosenService.findAll(filter, Number(page), Number(limit));
  }

  @Get('getAll')
  async getAllAlias(
    @Query('departemen') departemen: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const filter = departemen ? { Departemen: departemen } : {};
    return this.dosenService.findAll(filter, Number(page), Number(limit));
  }

  /** -----------------------------
   *  GET /dosen/:nip
   *  (alias getDosen)
   * -------------------------------- */
  @Get(':nip')
  findOne(@Param('nip') nip: string) {
    return this.dosenService.findByNip(nip);
  }

  @Get('getDosen/:nip')
  findOneAlias(@Param('nip') nip: string) {
    return this.dosenService.findByNip(nip);
  }

  /** -----------------------------
   *  POST /dosen
   *  (alias createDosen)
   * -------------------------------- */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() createDto: CreateDosenDto) {
    return this.dosenService.create(createDto);
  }

  @Post('createDosen')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  createAlias(@Body() createDto: CreateDosenDto) {
    return this.dosenService.create(createDto);
  }

  /** -----------------------------
   *  GET /dosen/getBimbingan/:nip
   *  Mengambil daftar mahasiswa bimbingan berdasarkan array id_Mahasiswa_Bimbingan
   * -------------------------------- */
  @Get('getBimbingan/:nip')
  async getBimbingan(@Param('nip') nip: string) {
    return this.dosenService.getBimbingan(nip);
  }

  @Delete(':nip')
async delete(@Param('nip') nip: string) {
  return this.dosenService.deleteDosen(nip);
}

@Delete('deleteDosen/:nip')
async deleteAlias(@Param('nip') nip: string) {
  return this.dosenService.deleteDosen(nip);
}

}

