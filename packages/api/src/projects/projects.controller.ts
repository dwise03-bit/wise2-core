import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto, CreateTrackDto } from './dto'

@Controller('api/v1/projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Request() req: any, @Body() createProjectDto: CreateProjectDto) {
    return await this.projectsService.create(req.user.userId, createProjectDto)
  }

  @Get()
  async findAll(@Request() req: any) {
    return await this.projectsService.findAll(req.user.userId)
  }

  @Get(':id')
  async findOne(@Param('id') projectId: string, @Request() req: any) {
    return await this.projectsService.findOne(projectId, req.user.userId)
  }

  @Patch(':id')
  async update(
    @Param('id') projectId: string,
    @Request() req: any,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectsService.update(projectId, req.user.userId, updateProjectDto)
  }

  @Delete(':id')
  async delete(@Param('id') projectId: string, @Request() req: any) {
    return await this.projectsService.delete(projectId, req.user.userId)
  }

  // Tracks endpoints
  @Post(':id/tracks')
  async addTrack(@Param('id') projectId: string, @Body() createTrackDto: CreateTrackDto) {
    return await this.projectsService.addTrack(projectId, createTrackDto)
  }

  @Get(':id/tracks')
  async getTracks(@Param('id') projectId: string) {
    return await this.projectsService.getTracks(projectId)
  }

  @Patch(':id/tracks/:trackId')
  async updateTrack(
    @Param('id') projectId: string,
    @Param('trackId') trackId: string,
    @Body() trackData: any,
  ) {
    return await this.projectsService.updateTrack(projectId, trackId, trackData)
  }

  @Delete(':id/tracks/:trackId')
  async deleteTrack(@Param('id') projectId: string, @Param('trackId') trackId: string) {
    return await this.projectsService.deleteTrack(projectId, trackId)
  }

  // Versions endpoints
  @Post(':id/versions')
  async createVersion(@Param('id') projectId: string, @Body() versionData: any) {
    return await this.projectsService.createVersion(projectId, versionData)
  }

  @Get(':id/versions')
  async getVersions(@Param('id') projectId: string) {
    return await this.projectsService.getVersions(projectId)
  }
}
