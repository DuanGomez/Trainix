import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Observable } from 'rxjs';
import { PaginatedResult } from '../../../core/models/pagination.model';

export interface Member {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  birthDate?: string;
  gender?: string;
  isActive: boolean;
  joinedAt: string;
  avatarUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthNotes?: string;
  objective?: string;
}

export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  birthDate?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthNotes?: string;
  objective?: string;
}

@Injectable({ providedIn: 'root' })
export class MembersService {
  private api = inject(ApiService);

  getAll(params: Record<string, any> = {}): Observable<PaginatedResult<Member>> {
    const query = new URLSearchParams(params as any).toString();
    return this.api.get<PaginatedResult<Member>>(`members?${query}`);
  }

  getById(id: string): Observable<Member> {
    return this.api.get<Member>(`members/${id}`);
  }

  create(dto: CreateMemberDto): Observable<Member> {
    return this.api.post<Member>('members', dto);
  }

  update(id: string, dto: Partial<CreateMemberDto>): Observable<Member> {
    return this.api.put<Member>(`members/${id}`, dto);
  }

  deactivate(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`members/${id}`);
  }
}
