import { Component, OnInit } from '@angular/core';
import { PatientCards } from '../patient-cards/patient-cards';
import { PatientService } from '../services/patient.service';


@Component({
  selector: 'app-patient-cards',
  templateUrl: './patient-cards.component.html',
  styleUrls: ['./patient-cards.component.css']
})

export class PatientCardsComponent implements OnInit {

  constructor(private patientCardsService: PatientService) { }

  allPatientCards: PatientCards[];
  countItems: number;

  getAllPatientCards(): void {
    this.patientCardsService
      .getAll()
      .subscribe(allPatientCards => {
        this.countItems = allPatientCards.length;
        this.allPatientCards = allPatientCards.dtoList;
        console.log(this.allPatientCards);
      });
  }


  ngOnInit() {
    this.getAllPatientCards();
  }

}
