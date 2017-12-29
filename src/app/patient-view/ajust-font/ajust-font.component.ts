import { Component, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-ajust-font',
  templateUrl: './ajust-font.component.html',
  styleUrls: ['./ajust-font.component.css']
})
export class AjustFontComponent implements AfterViewInit {

  fontSize: number;

  fontState = {
    medium: 0.7,
    big: 1.4
  };

  zoomState = {
    small: 1,
    medium: 1.03,
    big: 1.06
  };

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit() {
    this.fetchInitialFontSize();
  }

  // Catch the settings from the session storage or set an initial state
  fetchInitialFontSize() {
    this.fontSize = JSON.parse(sessionStorage.getItem('fontSize')) || 0;
    sessionStorage.setItem('fontSize', JSON.stringify(this.fontSize));

    // Set initial zoom
    switch (this.fontSize) {
      case 0: {
        this.renderer.setStyle(document.body, 'zoom', this.zoomState.small.toString());
        break;
      }
      case 1: {
        this.renderer.setStyle(document.body, 'zoom', this.zoomState.medium.toString());
        break;
      }
      case 2: {
        this.renderer.setStyle(document.body, 'zoom', this.zoomState.big.toString());
        break;
      }
    }
  }

  changeSize() {
    console.log(this.fontSize);

    const fontResizerElements = document.querySelectorAll('[font-resizer]');

    // Change font size
    for (let i = 0; i < fontResizerElements.length; i++) {

      const elementFontSize: string = window.getComputedStyle(fontResizerElements[i], null).getPropertyValue('font-size');
      let fontSizeNumber: number = parseFloat(elementFontSize.replace('px', ''));

      switch (this.fontSize) {
        case 0: {
          fontSizeNumber = fontSizeNumber + this.fontState.medium;
          this.renderer.setStyle(fontResizerElements[i], 'font-size', fontSizeNumber + 'px');
          break;
        }
        case 1: {
          fontSizeNumber = fontSizeNumber + this.fontState.big - this.fontState.medium;
          this.renderer.setStyle(fontResizerElements[i], 'font-size', fontSizeNumber + 'px');
          break;
        }
        case 2: {
          fontSizeNumber = fontSizeNumber - this.fontState.big;
          this.renderer.setStyle(fontResizerElements[i], 'font-size', fontSizeNumber + 'px');
          break;
        }
      }
    }

    // Change zoom
    switch (this.fontSize) {
      case 0: {
        this.renderer.setStyle(document.body, 'zoom', this.zoomState.medium.toString());
        this.fontSize++;
        sessionStorage.setItem('fontSize', JSON.stringify(this.fontSize));
        break;
      }
      case 1: {
        this.renderer.setStyle(document.body, 'zoom', this.zoomState.big.toString());
        this.fontSize++;
        sessionStorage.setItem('fontSize', JSON.stringify(this.fontSize));
        break;
      }
      case 2: {
        this.renderer.setStyle(document.body, 'zoom', this.zoomState.small.toString());
        this.fontSize = 0;
        sessionStorage.setItem('fontSize', JSON.stringify(this.fontSize));
        break;
      }
    }
  }
}
