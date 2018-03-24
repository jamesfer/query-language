
import { Component } from '@angular/core';
import { QLHinterService } from '../src/ql-hinter.service';

@Component({
  selector: 'ql-hint-list',
  templateUrl: './ql-hint-list.component.html',
  styleUrls: [ './ql-hint-list.component.scss' ],
})
export class QLHintListComponent {
  hints$ = this.hinterService.hints$;

  positionTop$ = this.hinterService.hintPosition$.map(pos => pos[0]);
  positionLeft$ = this.hinterService.hintPosition$.map(pos => pos[1]);

  selectedIndex = 0;

  constructor(protected hinterService: QLHinterService) {}

  moveSelectionDown() {
    console.log('going down');
    this.selectedIndex++;
  }

  moveSelectionUp() {
    console.log('going up');
    this.selectedIndex--;
  }

  makeSelection() {
    console.log('make selection');
  }

  goDown() {
    console.log('going down');
    this.selectedIndex++;
  }

  goUp() {
    console.log('going up');
    this.selectedIndex--;
  }
}
