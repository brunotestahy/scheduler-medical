import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.css']
})
export class GreetingComponent implements OnInit {

  @Input() myPatient: any;

  greeting: string;
  iconGreeting: string;
  firstName: string;

  constructor() {
  }

  // Considerar a possibilidade de mover esse método para um serviço.
  setGreetingImageAndText() {
    const rootPath = 'assets/img/';
    const curHr = (new Date()).getHours();
    if (curHr < 4) {
      this.greeting = 'boa noite';
      this.iconGreeting = rootPath + 'BOA_NOITE.png';
    } else if (curHr < 12) {
      this.greeting = 'bom dia';
      this.iconGreeting = rootPath + 'BOM_DIA.png';
    } else if (curHr < 18) {
      this.greeting = 'boa tarde';
      this.iconGreeting = rootPath + 'BOA_TARDE.png';
    } else {
      this.greeting = 'boa noite';
      this.iconGreeting = rootPath + 'BOA_NOITE.png';
    }
  }

  ngOnInit() {
    this.setGreetingImageAndText();

    this.firstName = this.myPatient.name.split(' ');
    this.myPatient.name = this.capitalizeFirstLetter(this.firstName[0]);

  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }


}
