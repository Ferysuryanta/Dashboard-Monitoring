import { NgModule } from '@angular/core';
import { CountUpPipe } from './pipes/count-up.pipe';

@NgModule({
  imports: [CountUpPipe],
  exports: [CountUpPipe]
})
export class SharedPipesModule {}
