import {
  trigger,
  style,
  animate,
  transition, animation, useAnimation
} from '@angular/animations';

const enterAnimationProps = animation([
  style({opacity: 0}),
  animate('{{ duration }}')
], {params: {duration: '500ms'}});

const leaveAnimationProps = animation([
  animate('{{ duration }}',
    style({opacity: 0}))
], {params: {duration: '500ms'}});

export const fadeAnimationTrigger = (params) => trigger('fadeAnimation', [
  transition(':enter',
    useAnimation(enterAnimationProps, {params: params})),
  transition(':leave',
    useAnimation(leaveAnimationProps, {params: params}))
]);
