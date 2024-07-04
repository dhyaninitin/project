import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CustomCurrencyPipe } from './custom-currency.pipe';
import { CustomPercentPipe } from './custom-percent.pipe';
import { ExcerptPipe } from './excerpt.pipe';
import { FilterListPipe } from './filter-list.pipe';
import { GetValueByKeyPipe } from './get-value-by-key.pipe';
import { PhonePipe } from './phone.pipe';
import { RelativeTimePipe } from './relative-time.pipe';
import { RemoveLinebreakPipe } from './remove-linebreak.pipe';
import {SortPipe} from './sort.pipe'

const pipes = [
  RelativeTimePipe,
  ExcerptPipe,
  GetValueByKeyPipe,
  RemoveLinebreakPipe,
  CustomCurrencyPipe,
  CustomPercentPipe,
  PhonePipe,
  FilterListPipe,
  SortPipe
];

@NgModule({
  imports: [CommonModule],
  declarations: pipes,
  exports: pipes,
})
export class SharedPipesModule {}
