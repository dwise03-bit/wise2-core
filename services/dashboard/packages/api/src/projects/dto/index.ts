export class CreateProjectDto {
  name!: string;
  description?: string;
  project_type?: string;
}

export class UpdateProjectDto {
  name?: string;
  description?: string;
  status?: string;
}

export class CreateTrackDto {
  name!: string;
  audio_url!: string;
  duration!: number;
}
