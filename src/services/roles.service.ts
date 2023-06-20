import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.role.findMany();
  }

  findOne(id: string) {
    return this.prismaService.role.findFirst({
      where: { id: id },
    });
  }

  create(createRoleDto: CreateRoleDto) {
    const { permissions, ...roleDto } = createRoleDto;
    return this.prismaService.role.create({
      data: {
        ...roleDto,
        permissions: {
          createMany: {
            data: permissions.map((p) => {
              return { permissionId: p };
            }),
          },
        },
      },
    });
  }

  update(id: string, updateVehicleDto: UpdateRoleDto) {
    const { permissions, ...roleDto } = updateVehicleDto;
    return this.prismaService.role.update({
      where: { id },
      data: {
        ...roleDto,
        permissions: {
          createMany: {
            data: permissions.map((p) => {
              return { permissionId: p };
            }),
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.vehicle.delete({
      where: { id },
    });
  }

  findAllPermissions() {
    return this.prismaService.permission.findMany();
  }
}
