import { Component, OnInit } from '@angular/core';
import { AppointmentCategoryService } from  '../services/appointment-category.service';
import { AppointmentCategory } from '../shared/models/appointment-category'

@Component({
  selector: 'app-appointment-category',
  templateUrl: './appointment-category.component.html',
  styleUrls: ['./appointment-category.component.css']
})
export class AppointmentCategoryComponent implements OnInit {

  constructor(
    private appointmentCategoryService: AppointmentCategoryService
  )
   {

   }

   appointmentCategories: AppointmentCategory[];
   countItems: number;

   getAll(): void {
    this.appointmentCategoryService
      .getCategories()
      .subscribe(appointmentCategories => {
        this.countItems = appointmentCategories.length;
        this.appointmentCategories = appointmentCategories.values;
      });
  }

  ngOnInit() {
    this.getAll();
  }

}
