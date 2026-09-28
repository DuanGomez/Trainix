import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Member } from '../../modules/members/entities/member.entity';

/**
 * Busca un cliente activo por ID, código (TX-0001) o número de documento.
 * Los formularios del frontend permiten ingresar cualquiera de los tres.
 */
export async function findMemberByQuery(
  repo: Repository<Member>,
  query: string,
  gymId: string,
): Promise<Member> {
  const value = query?.trim();
  const member = value
    ? await repo.findOne({
        where: [
          { gymId, id: value, isActive: true },
          { gymId, memberCode: value.toUpperCase(), isActive: true },
          { gymId, documentNumber: value, isActive: true },
        ],
      })
    : null;
  if (!member) throw new NotFoundException('Cliente no encontrado');
  return member;
}
