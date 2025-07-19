import { Injectable } from '@nestjs/common';
import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { UpdateUserRoleDto } from './dto/update-user_role.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRolesService {
  constructor(private prisma: PrismaService) {}

  create(createUserRoleDto: CreateUserRoleDto) {
    return this.prisma.userRole.create({ data: createUserRoleDto });
  }

  findAll() {
    return this.prisma.userRole.findMany();
  }

  findOne(userId: string, roleId: string) {
    return this.prisma.userRole.findUnique({ where: { userId_roleId: { userId, roleId } } });
  }

  update(userId: string, roleId: string, updateUserRoleDto: UpdateUserRoleDto) {
    return this.prisma.userRole.update({ where: { userId_roleId: { userId, roleId } }, data: updateUserRoleDto });
  }

  remove(userId: string, roleId: string) {
    return this.prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
  }
}
