import { Component, Input, OnInit } from '@angular/core';
import { ApexOptions } from '../../chart/chart.component';
import { defaultChartOptions } from '../../../utils/default-chart-options';
import { createDateArray } from '../../../utils/create-date-array';

@Component({
  selector: 'vex-widget-large-chart',
  templateUrl: './widget-large-chart.component.html',
  styleUrls: ['./widget-large-chart.component.scss']
})
export class WidgetLargeChartComponent implements OnInit {

  @Input() series: ApexNonAxisChartSeries | ApexAxisChartSeries;
  @Input() options: ApexOptions = defaultChartOptions({
    // grid: {
    //   show: true,
    //   strokeDashArray: 3,
    //   padding: {
    //     left: 16
    //   }
    // },
    // chart: {
    //   type: 'bar',
    //   height: 384,
    //   sparkline: {
    //     enabled: false
    //   },
    //   zoom: {
    //     enabled: false
    //   }
    // },
    // fill: {
    //   type: 'gradient',
    //   gradient: {
    //     shadeIntensity: 0.9,
    //     opacityFrom: 0.7,
    //     opacityTo: 0.5,
    //     stops: [0, 90, 100]
    //   }
    // },
    // colors: ['#008ffb', '#ff9800'],
    // labels: createDateArray(12),
    // xaxis: {
    //   type: 'datetime',
    //   labels: {
    //     show: true
    //   },
    // },
    // yaxis: {
    //   labels: {
    //     show: true
    //   }
    // },
    // legend: {
    //   show: true,
    //   itemMargin: {
    //     horizontal: 4,
    //     vertical: 4
    //   }
    // }
    grid: {
      show: true,
      strokeDashArray: 3,
      padding: {
        left: 16
      }
    },
    chart: {
      type: 'bar',
      height: 384,
      sparkline: {
        enabled: false
      },
      zoom: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        // endingShape: "rounded"
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: [
        " 12 Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct"
      ],
      type: 'category',
      labels: {
        show: true
      }
    },
    yaxis: {
      title: {
        text: "$ (thousands)"
      },
        labels: {
        show: true
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return "$ " + val + " thousands";
        }
      }
    },
    legend: {
      show: true,
      itemMargin: {
        horizontal: 4,
        vertical: 4
      }
    }
  });

  constructor() { }

  ngOnInit() {
  }

}
