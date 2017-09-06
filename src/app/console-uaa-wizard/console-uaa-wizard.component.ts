import { UAASetupState } from './../store/reducers/uaa-setup.reducers';
import { SetupUAA } from './../store/actions/setup.actions';
import { AppState } from './../store/app-state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { StepOnNextFunction } from '../step/step.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NgForm } from '@angular/forms/src/directives';
import { Component, OnInit, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-console-uaa-wizard',
  templateUrl: './console-uaa-wizard.component.html',
  styleUrls: ['./console-uaa-wizard.component.scss']
})
export class ConsoleUaaWizardComponent implements OnInit, AfterContentInit {

  constructor(public store: Store<AppState>) { }

  uaaForm: FormGroup;
  validateUAAForm: Observable<boolean>;

  uaaFormNext: StepOnNextFunction = () => {
    this.store.dispatch(new SetupUAA({
      uaa_endpoint: this.uaaForm.get('apiUrl').value,
      console_client: this.uaaForm.get('clientId').value,
      password: this.uaaForm.get('adminPassword').value,
      skip_ssl_validation: true,
      username: this.uaaForm.get('adminUsername').value,
      console_client_secret: this.uaaForm.get('clientSecret').value,
    }));
    return this.store.select('uaaSetup')
      .skipWhile((state: UAASetupState) => {
        return state.settingUp;
      })
      .map((state: UAASetupState) => ({
        success: !state.error,
        message: state.message
      }));
  }
  ngOnInit() {
    this.uaaForm = new FormGroup({
      apiUrl: new FormControl('', [<any>Validators.required]),
      clientId: new FormControl('', [<any>Validators.required]),
      clientSecret: new FormControl(''),
      adminUsername: new FormControl('', [<any>Validators.required]),
      adminPassword: new FormControl('', [<any>Validators.required]),
    });

    let observer;
    this.validateUAAForm = Observable.create((_observer) => {
      observer = _observer;
      observer.next(false);
    });

    this.uaaForm.valueChanges.subscribe(() => {
      observer.next(this.uaaForm.valid);
    });
  }

  ngAfterContentInit() {
  }

}
