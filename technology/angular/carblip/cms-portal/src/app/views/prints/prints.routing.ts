import { Routes } from '@angular/router';

import { QuoteComponent } from './quote/quote.component';

export const PrintsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'quote/:id',
        component: QuoteComponent,
        data: { title: 'Quote' },
      },
    ],
  },
];
