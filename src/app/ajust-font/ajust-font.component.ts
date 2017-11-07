import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ajust-font',
  templateUrl: './ajust-font.component.html',
  styleUrls: ['./ajust-font.component.css']
})
export class AjustFontComponent implements OnInit {

  fontSize: number;

  constructor() {
  }

  ngOnInit() {
    this.fontSize = JSON.parse(sessionStorage.getItem('fontSize')) || 1;
    document.body.style.fontSize = String(this.fontSize);
  }

  changeSize() {
    if (this.fontSize < 2) {
      if (document.body.style.fontSize === '') {
        document.body.style.fontSize = '1.0em';
      }
      document.body.style.fontSize = parseFloat(document.body.style.fontSize) + (1 * 0.2) + 'em';
      this.fontSize++;
      sessionStorage.setItem('fontSize', JSON.stringify(this.fontSize));
    } else {
      this.resetSize();
    }
  }

  resetSize() {
    if (this.fontSize > 0) {
      document.body.style.fontSize = '1.0em';
      this.fontSize = 0;
      sessionStorage.setItem('fontSize', JSON.stringify(this.fontSize));
    }
  }
}
