import {
  AfterContentInit, Component, ContentChildren, QueryList, ViewChild, input, output,
} from '@angular/core';
import { MatColumnDef, MatTable, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatProgressSpinnerModule, EmptyStateComponent,
  ],
  template: `
    <div class="table-wrapper">
      @if (loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="48" />
        </div>
      }

      <table mat-table [dataSource]="data()" class="full-width">
        <ng-content />

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns();"
            [class.clickable]="rowClickable()"
            (click)="rowClick.emit(row)"></tr>

        <tr class="mat-row" *matNoDataRow>
          <td [attr.colspan]="displayedColumns().length" class="empty-cell">
            <app-empty-state />
          </td>
        </tr>
      </table>

      @if (total() > 0) {
        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="pageChange.emit($event)"
          showFirstLastButtons />
      }
    </div>
  `,
  styles: [`
    .table-wrapper { position: relative; border-radius: 20px; overflow-x: auto; background: var(--tx-surface); border: 1px solid var(--tx-line); }
    .loading-overlay {
      position: absolute; inset: 0; background: rgba(10,10,10,0.6);
      display: flex; align-items: center; justify-content: center; z-index: 5;
    }
    .full-width { width: 100%; }
    .clickable { cursor: pointer; }
    .clickable:hover { background: rgba(255, 200, 0, 0.04); }
    .empty-cell { padding: 0; }
  `],
})
export class DataTableComponent implements AfterContentInit {
  // Las columnas llegan por <ng-content>: hay que registrarlas a mano en la tabla interna.
  @ContentChildren(MatColumnDef) private columnDefs!: QueryList<MatColumnDef>;
  @ViewChild(MatTable, { static: true }) private table!: MatTable<any>;

  data             = input.required<any[]>();
  displayedColumns = input.required<string[]>();
  total            = input(0);
  pageSize         = input(25);
  loading          = input(false);
  rowClickable     = input(false);
  rowClick         = output<any>();
  pageChange       = output<PageEvent>();

  ngAfterContentInit(): void {
    this.columnDefs.forEach((def) => this.table.addColumnDef(def));
  }
}
