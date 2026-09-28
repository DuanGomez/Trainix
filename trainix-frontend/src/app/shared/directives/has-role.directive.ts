import { Directive, inject, input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

@Directive({ selector: '[appHasRole]', standalone: true })
export class HasRoleDirective {
  private authStore = inject(AuthStore);
  private tpl       = inject(TemplateRef<any>);
  private vcr       = inject(ViewContainerRef);

  appHasRole = input.required<string | string[]>();

  constructor() {
    effect(() => {
      const roles = this.appHasRole();
      const list  = Array.isArray(roles) ? roles : [roles];
      const ok    = this.authStore.hasRole(...list);
      this.vcr.clear();
      if (ok) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}
