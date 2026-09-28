import { Component, inject, input, output, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [formControl]="ctrl" [placeholder]="placeholder()" />
      @if (ctrl.value) {
        <button mat-icon-button matSuffix (click)="clear()">
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  `,
  styles: [`.search-field { width: 100%; max-width: 400px; }`],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  placeholder = input('Buscar...');
  searched    = output<string>();

  ctrl = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.ctrl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((v) => this.searched.emit(v ?? ''));
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  clear(): void { this.ctrl.setValue(''); }
}
