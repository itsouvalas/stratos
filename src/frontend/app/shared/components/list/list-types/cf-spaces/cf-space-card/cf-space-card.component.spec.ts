// import { async, ComponentFixture, TestBed } from '@angular/core/testing';

// import { EntityServiceFactory } from '../../../../../../core/entity-service-factory.service';
// import {
//   generateTestCfEndpointServiceProvider,
//   generateTestCfUserServiceProvider,
//   getBaseTestModulesNoShared,
// } from '../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
// import { CfOrgSpaceDataService } from '../../../../../data-services/cf-org-space-service.service';
// import { EntityMonitorFactory } from '../../../../../monitors/entity-monitor.factory.service';
// import { PaginationMonitorFactory } from '../../../../../monitors/pagination-monitor.factory';
// import {
//   ApplicationStateIconComponent,
// } from '../../../../application-state/application-state-icon/application-state-icon.component';
// import { ApplicationStateIconPipe } from '../../../../application-state/application-state-icon/application-state-icon.pipe';
// import { CardStatusComponent } from '../../../../cards/card-status/card-status.component';
// import { MetaCardComponent } from '../../../list-cards/meta-card/meta-card-base/meta-card.component';
// import { MetaCardItemComponent } from '../../../list-cards/meta-card/meta-card-item/meta-card-item.component';
// import { MetaCardKeyComponent } from '../../../list-cards/meta-card/meta-card-key/meta-card-key.component';
// import { MetaCardTitleComponent } from '../../../list-cards/meta-card/meta-card-title/meta-card-title.component';
// import { MetaCardValueComponent } from '../../../list-cards/meta-card/meta-card-value/meta-card-value.component';

// describe('CfOrgCardComponent', () => {
//   let component: CfOrgCardComponent;
//   let fixture: ComponentFixture<CfOrgCardComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [CfOrgCardComponent, MetaCardComponent, MetaCardItemComponent,
//         MetaCardKeyComponent, ApplicationStateIconPipe, ApplicationStateIconComponent,
//         MetaCardTitleComponent, CardStatusComponent, MetaCardValueComponent],
//       imports: [...getBaseTestModulesNoShared],
//       providers: [PaginationMonitorFactory, EntityMonitorFactory, generateTestCfUserServiceProvider(),
//         CfOrgSpaceDataService, generateTestCfEndpointServiceProvider(), EntityServiceFactory]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(CfOrgCardComponent);
//     component = fixture.componentInstance;
//     component.row = {
//       entity: {
//         spaces: [],
//         guid: '',
//         cfGuid: '',
//         quota_definition: {
//           entity: {
//             memory_limit: 1000,
//             app_instance_limit: -1,
//             instance_memory_limit: -1,
//             name: ''
//           },
//           metadata: null
//         }
//       },
//       metadata: null
//     };
//     fixture.detectChanges();
//   });

//   it('should create', () => {

//     expect(component).toBeTruthy();
//   });
// });