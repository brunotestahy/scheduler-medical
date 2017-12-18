import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CareplanService } from '../../services/careplan.service';
import { Careplan } from '../../shared/models/careplan';
import { CareplanActivityCategory } from '../../shared/models/careplan-activity-category';
import { CareplanActivityCategories } from '../../shared/models/careplan-activity-categories';
import { CareplanActivityType } from '../../shared/models/careplan-activity-type';
import { CareplanActivityTypes } from '../../shared/models/careplan-activity-types';
import { Subscription } from 'rxjs/Subscription';
import { RefreshService } from '../../services/refresh.service';
import { ScheduleService } from '../../services/schedule.service';

declare var startApp: any;

@Component({
  selector: 'care-plan-list',
  templateUrl: './care-plan-list.component.html',
  styleUrls: ['./care-plan-list.component.css']
})
export class CarePlanListComponent implements OnInit, OnDestroy {

  @Input() patientId;
  headerLabel: string = 'Meu Plano<br>de Cuidados';
  headerLabelNoCareplan: string = 'Sem registros<br>no Plano de Cuidados';

  patientCareplan;
  private carePlanData: any;
  private careplanActivityTypes: CareplanActivityTypes;
  private careplanActivityCategories: CareplanActivityCategories;
  activeDay;
  // Subscriptions
  refreshSubscription: Subscription;
  dateEventSubscription: Subscription;
  done: number;
  qtd: number;
  percent: number;

  constructor(private translateService: TranslateService,
              private scheduleService: ScheduleService,
              private careplanService: CareplanService,
              private refreshService: RefreshService) {
  }

  ngOnInit() {
    this.checkLanguage();
    this.loadGeneralListeners();
    this.fetchCarePlanData();
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  loadGeneralListeners() {
    // Capture the refresh button state
    this.refreshSubscription = this.refreshService.handleRefreshState$
      .subscribe((shouldRefresh: boolean) => {
        if (shouldRefresh) {
          this.fetchCarePlanData();
        }
      });

    this.dateEventSubscription = this.scheduleService.handleDateChange$
      .subscribe((newDate: Date) => {
        this.activeDay = newDate;
        this.activitiesDone();
      });
  }


  unloadGeneralListeners() {
    this.refreshSubscription.unsubscribe();
    this.dateEventSubscription.unsubscribe();
  }

  fetchCarePlanData() {
    console.log(this.patientId);
    this.careplanService.getCareplanActivityTypes().subscribe(
      activityTypes => {
        this.careplanActivityTypes = activityTypes;
        this.careplanService.getCareplaneActivityCategories().subscribe(
          activityCategories => {
            this.careplanActivityCategories = activityCategories;

            this.careplanService.getPatientCareplan(this.patientId).subscribe(
              patientCareplan => {
                console.log(patientCareplan);
                this.patientCareplan = patientCareplan;
                this.patientCareplan.activities.forEach(atividade => {
                  this.careplanActivityTypes.values.forEach(tipo => {
                    if (tipo.code === atividade.type) {
                      atividade.typeDisplay = tipo.display;
                      this.careplanActivityCategories.values.forEach(categoria => {
                        if (categoria.code === tipo.category.code) {
                          atividade.categoryDisplay = categoria.display;
                        }
                      });
                    }
                  });
                });
                this.activitiesDone();
              },
              error => {
                this.handleError(error);
              }
            );
          },
          error => {
            this.handleError(error);
          }
        );
      },
      error => {
        this.handleError(error);
      }
    );
  }

  handleError(error: any) {
    console.error(error);
  }

  checkLanguage() {
    if (this.translateService.getDefaultLang() === 'en') {
      this.headerLabel = 'My Care<br>Plan';
    }
  }

  openCarePlan() {
    const CAREPLAN_URL = 'careplan://';
    startApp.set(CAREPLAN_URL).start(
      function() { /* success */
        console.log('OK. Chamada...');
      }, function(error) { /* fail */
        console.error(error);
      }
    );
  }

  activitiesDone() {
    this.done = 0;
    this.qtd = 0;
    console.log(this.patientCareplan);
    if (!this.activeDay) {
      this.activeDay = new Date();
    }

    if (this.patientCareplan) {
      this.patientCareplan.activities.filter( (currentValue) => {
        return this.isSameDate(new Date(currentValue.scheduledPeriod.startDate.dateTime), this.activeDay);
      }).map((current) => {
        if (current.status === 'completed') {
          this.done++;
        }
        this.qtd++;
      });
    }

    if (this.qtd > 0) {
      this.percent = this.done / this.qtd * 100;
    } else {
      this.percent = 0;
    }
}

  isSameDate(date1: Date, date2: Date) {
    return (date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
  }

}
