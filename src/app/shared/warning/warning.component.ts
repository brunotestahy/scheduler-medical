import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.css']
})
export class WarningComponent implements OnInit {

  @Input() upperSentence;
  @Input() lowerSentence;

  constructor() { }

  ngOnInit() {
  }

}