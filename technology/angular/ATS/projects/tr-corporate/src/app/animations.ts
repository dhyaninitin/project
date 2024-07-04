import {
  trigger,
  animate,
  transition,
  style,
  query,
  state
} from '@angular/animations';

export const fadeAnimation = trigger('fadeInOut', [
  state('void', style({
    opacity: 0
  })),
  transition('void <=> *', animate(400)),
]);

export const inOutAnimation: [any] = [
  trigger(
    'inOutAnimation',
    [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('250ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('250ms ease-out', style({ transform: 'translateX(100%)' }))
      ]),
    ]
  )
];

export const fadeinAnimation: [any] = [
  trigger(
    'fadeinAnimation',
    [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('250ms ease-in', style({ opacity: 0 }))
      ]),
    ]
  )
];

export const popOverAnimation: [any] = [
  trigger(
    'popOverAnimation', 
    [
      transition(
        ':enter', 
        [
          style({ height: 0, opacity: 0 }),
          animate('250ms ease-out', style({ height: 325, opacity: 1 }))
        ]
      ),
      transition(
        ':leave', 
        [
          style({ height: 325, opacity: 1 }),
          animate('250ms ease-in', style({ height: 0, opacity: 0 }))
        ]
      )
    ]
  )
]