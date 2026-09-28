import { Injectable, inject, signal, computed } from '@angular/core';
import { MembersService, Member } from '../services/members.service';

@Injectable({ providedIn: 'root' })
export class MembersStore {
  private svc = inject(MembersService);

  private _items   = signal<Member[]>([]);
  private _total   = signal(0);
  private _loading = signal(false);
  private _page    = signal(1);
  private _search  = signal('');

  items   = computed(() => this._items());
  total   = computed(() => this._total());
  loading = computed(() => this._loading());
  page    = computed(() => this._page());

  load(overrides: Record<string, any> = {}): void {
    this._loading.set(true);
    const params = {
      page:   this._page(),
      limit:  25,
      search: this._search(),
      ...overrides,
    };
    this.svc.getAll(params).subscribe({
      next: (result) => {
        this._items.set(result.data);
        this._total.set(result.total);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  setPage(page: number): void  { this._page.set(page); this.load(); }
  setSearch(q: string): void   { this._search.set(q); this._page.set(1); this.load(); }

  remove(id: string): void {
    this.svc.deactivate(id).subscribe(() => this.load());
  }
}
