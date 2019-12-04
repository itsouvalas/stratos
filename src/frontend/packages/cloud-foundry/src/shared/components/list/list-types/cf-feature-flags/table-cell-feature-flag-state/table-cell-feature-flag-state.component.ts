import { Component, Input } from '@angular/core';

import { IFeatureFlag } from '../../../../../../../../core/src/core/cf-api.types';
import { TableCellCustom } from '../../../../../../../../core/src/shared/components/list/list.types';

@Component({
  selector: 'app-table-cell-feature-flag-state',
  templateUrl: './table-cell-feature-flag-state.component.html',
  styleUrls: ['./table-cell-feature-flag-state.component.scss']
})
export class TableCellFeatureFlagStateComponent extends TableCellCustom<IFeatureFlag> {
  @Input() row: IFeatureFlag;
}
