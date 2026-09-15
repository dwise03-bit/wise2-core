import { Injectable } from '@nestjs/common'

@Injectable()
export class ProductsService {
  async findAll() {
    return {
      status: 'success',
      data: [],
    }
  }

  async findOne(id: string) {
    return {
      status: 'success',
      data: null,
    }
  }

  async create(dto: any) {
    return {
      status: 'success',
      data: dto,
    }
  }

  async update(id: string, dto: any) {
    return {
      status: 'success',
      data: { id, ...dto },
    }
  }

  async delete(id: string) {
    return {
      status: 'success',
      message: 'Deleted',
    }
  }
}
