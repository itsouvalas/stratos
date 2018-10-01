import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CardStatus } from '../../../../../../shared/components/application-state/application-state.service';
import { MetricsConfig } from '../../../../../../shared/components/metrics-chart/metrics-chart.component';
import { MetricsLineChartConfig } from '../../../../../../shared/components/metrics-chart/metrics-chart.types';
import { MetricQueryType } from '../../../../../../shared/services/metrics-range-selector.types';
import { IMetricMatrixResult } from '../../../../../../store/types/base-metric.types';
import { IMetricCell } from '../../../../../../store/types/metric.types';
import { CloudFoundryCellService } from '../cloud-foundry-cell.service';

@Component({
  selector: 'app-cloud-foundry-cell-summary',
  templateUrl: './cloud-foundry-cell-summary.component.html',
  styleUrls: ['./cloud-foundry-cell-summary.component.scss'],
})
export class CloudFoundryCellSummaryComponent {

  public status$: Observable<CardStatus>;
  public metricsConfig: MetricsConfig<IMetricMatrixResult<IMetricCell>>;
  public chartConfig: MetricsLineChartConfig;


  constructor(
    public cfCellService: CloudFoundryCellService
  ) {

    this.metricsConfig = this.cfCellService.buildMetricConfig('firehose_value_metric_rep_unhealthy_cell', MetricQueryType.QUERY);
    this.chartConfig = this.cfCellService.buildChartConfig('0 = Healthy, 1 = Unhealthy');

    this.status$ = cfCellService.healthy$.pipe(
      map(health => {
        if (health === undefined) {
          return CardStatus.NONE;
        }
        return health === '0' ? CardStatus.OK : CardStatus.ERROR;
      })
    );
  }
}
