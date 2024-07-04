import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  SelectedSort!: string;
  SelectedStatus!: number;
  SelectedRole!: number;
  constructor() { }

  set selectedSort(data: string) {
    this.SelectedSort = data;
  }
  set selectedStatus(data: number) {
    this.SelectedStatus = data;
  }
  set selectedRole(data: number) {
    this.SelectedRole = data;
  }

  get selectedSort() {
    return this.SelectedSort;
  }
  get selectedStatus() {
    return this.SelectedStatus;
  }
  get selectedRole() {
    return this.SelectedRole;
  }


}
