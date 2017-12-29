import { Component, OnDestroy, OnInit } from '@angular/core';
import { Notices } from '../../shared/models/notices';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AlertsScopeService } from '../../services/alerts-scope.service';

@Component({
  selector: 'app-alerts-scope',
  templateUrl: './alerts-scope.component.html',
  styleUrls: ['./alerts-scope.component.css']
})
export class AlertsScopeComponent implements OnInit, OnDestroy {

  notices: Notices[];
  noticesCount: number;
  communications = {
    dtoList: []
  };
  myPlan: any;
  myAllergies = {
    dtoList: []
  };
  myIssues = {
    dtoList: []
  };
  myPatient: any;
  showNotices: boolean;
  showSafety: boolean;
  showAllergies: boolean;
  showInfos: boolean;

  badgeCounters = {
    notice: 0,
    safety: 0,
    allergy: 0,
    info: 0
  };

  // Subscriptions
  private notificationSubscription: Subscription;

  constructor(private router: Router,
              private alertScopeService: AlertsScopeService) {
  }

  ngOnInit() {
    this.notices = [
      {
        id: 1, type: 'Fisioterapia', messages: [
        'Apertar a esfera de plástico 80 vezes com cada mão',
        'Fazer exercício respiratório',
        'Fazer bombeamento com a panturrilha'
      ]
      },
      {
        id: 2, type: 'Enfermagem', messages: [
        'Higienizar a ferida com água e sabão',
        '30 minutos de nebulização',
        'Fazer curativo na escara'
      ]
      }
    ];

    this.setNoticesCount();

    this.loadGeneralListeners();
  }

  ngOnDestroy() {
    this.unloadGeneralListeners();
  }

  loadGeneralListeners() {
    this.notificationSubscription = this.alertScopeService.handleNotification$
      .subscribe((notification) => {

      });
  }

  unloadGeneralListeners() {
    this.notificationSubscription.unsubscribe();
  }

  loadPlan(event: any, element: any) {
    console.log(event.target);
    console.log(element);
  }

  setNoticesCount() {
    this.badgeCounters.notice = this.notices.reduce((prev, current) => {
      return prev + current.messages.length;
    }, 0);
  }
}
