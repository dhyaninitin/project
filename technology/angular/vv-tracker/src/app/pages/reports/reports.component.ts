import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, UntypedFormControl, Validators } from "@angular/forms";
import { ApexOptions } from "src/@vex/components/chart/chart.component";
import { AdminService } from "../shared/services/admin.service";
import * as moment from 'moment';

@Component({
  selector: "vex-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"],
})
export class ReportsComponent implements OnInit {
  layoutCtrl = new UntypedFormControl("boxed");
  userData: any[] = [];
  From: any = new FormControl();
  To: any = new FormControl();

  options: ApexOptions = {
    chart: {
      type: "bar",
      height: 458,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: ["No Data Available"],
      labels: {
        show: true,
      },
    },
    yaxis: {
      labels: {
        show: true,
      },
    },
  };

  series: ApexAxisChartSeries = [
    {
      name: "Page Views",
      data: [0],
    },
  ];

  chosenItem = "1";
  radioValue: any;
  toChanged: boolean = false;
  constructor(
    private _adminSer: AdminService,
    private _cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.onRadioBtnSelection("1");
    this.To.valueChanges.subscribe((value: any) => {
      if (value) {
        if (this.radioValue == '2') {
          if (moment(this.From.value).format('YYYY-MM-DD') != this.getDefaultStartDate() || moment(this.To.value).format('YYYY-MM-DD') != this.getDefaultEndDate()) {
            this.toChanged = true;
            this.onRadioBtnSelection(this.radioValue);
          }
        }
        if (this.radioValue == '3') {
          if (moment(this.From.value).format('YYYY-MM-DD') != this.getDefaultStartOfMonth() || moment(this.To.value).format('YYYY-MM-DD') != this.getDefaultEndOfMonth()) {
            this.toChanged = true;
            this.onRadioBtnSelection(this.radioValue);
          }
        }

      }
    });
  }

  getTodayDate(): string {
    let today = moment();
    return today.format('YYYY-MM-DD');
  }

  getDefaultStartDate(): string {
    let startOfWeek = moment().startOf('isoWeek');
    return startOfWeek.format('YYYY-MM-DD');
  }

  getDefaultEndDate(): string {
    let endOfWeek = moment().endOf('isoWeek');
    return endOfWeek.format('YYYY-MM-DD');
  }

  getDefaultStartOfMonth(): string {
    let startOfMonth = moment().startOf('month');
    return startOfMonth.format('YYYY-MM-DD');
  }

  getDefaultEndOfMonth(): string {
    let endOfMonth = moment().endOf('month');
    return endOfMonth.format('YYYY-MM-DD');
  }

  onRadioBtnSelection(event: any) {
    const value = event;
    this.radioValue = event;
    if (value == "1") {
      this.From.value = this.getTodayDate();
      this.To.value = this.getTodayDate();
    } else if (value == "2" && !this.toChanged) {
      this.From.patchValue(this.getDefaultStartDate())
      this.To.patchValue(this.getDefaultEndDate())
    } else if (value == "3" && !this.toChanged) {
      this.From.patchValue(this.getDefaultStartOfMonth())
      this.To.patchValue(this.getDefaultEndOfMonth())
    }

    let payload = {
      from: moment(this.From.value).format('YYYY-MM-DD'),
      to: moment(this.To.value).format('YYYY-MM-DD')
    }
    this._adminSer.filterUserReports(value, payload).subscribe((res: any) => {
      if (res) {
        let userData = [];
        userData = res;

        if (userData.length >= 1) {
          const tooltipStyles = `
          background-color: #ffffff; 
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
          border: 1px solid #ccc; 
          padding: 10px; 
          border-radius: 4px; 
          text-align: left;`;
          const divStyles = "margin: 4px 0;";

          function formatTime(decimalTime: number): string {
            const hours = Math.floor(decimalTime);
            const minutes = Math.round((decimalTime - hours) * 60);
            if (hours > 0 && minutes > 0) {
              return `${hours} hrs ${minutes} min`;
            } else if (hours > 0) {
              return `${hours} hrs`;
            } else if (minutes > 0) {
              return `${minutes} min`;
            } else {
              return "0 min";
            }
          }

          if (value == "1") {
            const categories: string[] = [];
            const dailyHours: number[] = [];
            const totalClicks: number[] = [];
            const totalKeyPresses: number[] = [];

            userData.forEach((user: any) => {
              if (user.lastWorkStatus.length > 0) {
                const categoryLabel = `${user.empid} (${user.firstname} ${user.lastname.charAt(0)})`;
                categories.push(categoryLabel);

                const clicks = user.lastWorkStatus.reduce(
                  (total: any, status: { mouseclicks: any }) =>
                    total + status.mouseclicks,
                  0
                );
                const keyPresses = user.lastWorkStatus.reduce(
                  (total: any, status: { keypresses: any }) =>
                    total + status.keypresses,
                  0
                );

                const monthlyMinutes = user.lastWorkStatus.length * 10;
                const monthlyHoursCalc = monthlyMinutes / 60;
                const parseHours = parseFloat(monthlyHoursCalc.toFixed(2));

                totalClicks.push(clicks);
                totalKeyPresses.push(keyPresses);
                dailyHours.push(parseHours);
              } else {
                const categoryLabel = `${user.empid} (${user.firstname} ${user.lastname.charAt(0)})`;
                categories.push(categoryLabel);

                const clicks = user.lastWorkStatus.reduce(
                  (total: any, status: { mouseclicks: any }) =>
                    total + status.mouseclicks,
                  0
                );
                const keyPresses = user.lastWorkStatus.reduce(
                  (total: any, status: { keypresses: any }) =>
                    total + status.keypresses,
                  0
                );

                totalClicks.push(clicks);
                totalKeyPresses.push(keyPresses);
                dailyHours.push(0);
              }
            });

            this.options = {
              chart: {
                type: "bar",
                height: 458,
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: "20%",
                },
              },
              dataLabels: {
                enabled: false,
              },
              xaxis: {
                type: "category",
                categories: categories,
                labels: {
                  show: true,
                },
              },
              yaxis: {
                labels: {
                  show: true,
                },
              },
              tooltip: {
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                  const user = userData[dataPointIndex];

                  // Calculate total clicks and key presses
                  const totalClicks = user.lastWorkStatus.reduce(
                    (total: any, status: { mouseclicks: any }) =>
                      total + status.mouseclicks,
                    0
                  );
                  const totalKeyPresses = user.lastWorkStatus.reduce(
                    (total: any, status: { keypresses: any }) =>
                      total + status.keypresses,
                    0
                  );

                  return `<div style="${tooltipStyles}" class="custom-tooltip">
                    <div style="${divStyles}"><b>Employee ID:</b> ${user.empid}</div>
                    <div style="${divStyles}"><b>Name:</b> ${user.firstname} ${user.lastname}</div>
                    <div style="${divStyles}"><b>Email:</b> ${user.email}</div>
                    <div style="${divStyles}"><b>Mouse Clicks:</b> ${totalClicks.toLocaleString()}</div>
                    <div style="${divStyles}"><b>Keypresses:</b> ${totalKeyPresses.toLocaleString()}</div>
                    <div style="${divStyles}"><b>Today's Session:</b> ${formatTime(dailyHours[dataPointIndex])} </div>
                  </div>`;
                },
              },
            };

            this.series = [
              {
                name: "Today's Session",
                data: dailyHours,
              },
            ];
          } else if (value == "2") {
            const categories: string[] = [];
            const weeklyHours: number[] = [];
            const totalClicks: number[] = [];
            const totalKeyPresses: number[] = [];

            userData.forEach((user: any) => {
              if (user.lastWorkStatus.length > 0) {
                const categoryLabel = `${user.empid} (${user.firstname} ${user.lastname.charAt(0)})`;
                categories.push(categoryLabel);

                const clicks = user.lastWorkStatus.reduce(
                  (total: any, status: { mouseclicks: any }) =>
                    total + status.mouseclicks,
                  0
                );
                const keyPresses = user.lastWorkStatus.reduce(
                  (total: any, status: { keypresses: any }) =>
                    total + status.keypresses,
                  0
                );

                const monthlyMinutes = user.lastWorkStatus.length * 10;
                const monthlyHoursCalc = monthlyMinutes / 60;
                const parseHours = parseFloat(monthlyHoursCalc.toFixed(2));

                totalClicks.push(clicks);
                totalKeyPresses.push(keyPresses);
                weeklyHours.push(parseHours);
              } else {
                const categoryLabel = `${user.empid} (${user.firstname} ${user.lastname.charAt(0)})`;
                categories.push(categoryLabel);

                const clicks = user.lastWorkStatus.reduce(
                  (total: any, status: { mouseclicks: any }) =>
                    total + status.mouseclicks,
                  0
                );
                const keyPresses = user.lastWorkStatus.reduce(
                  (total: any, status: { keypresses: any }) =>
                    total + status.keypresses,
                  0
                );

                totalClicks.push(clicks);
                totalKeyPresses.push(keyPresses);
                weeklyHours.push(0);
              }
            });

            this.options = {
              chart: {
                type: "bar",
                height: 458,
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: "20%",
                },
              },
              dataLabels: {
                enabled: false,
              },
              xaxis: {
                type: "category",
                categories: categories,
                labels: {
                  show: true,
                },
              },
              yaxis: {
                labels: {
                  show: true,
                },
              },
              tooltip: {
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                  const user = userData[dataPointIndex];

                  // Calculate total clicks and key presses
                  const totalClicks = user.lastWorkStatus.reduce(
                    (total: any, status: { mouseclicks: any }) =>
                      total + status.mouseclicks,
                    0
                  );
                  const totalKeyPresses = user.lastWorkStatus.reduce(
                    (total: any, status: { keypresses: any }) =>
                      total + status.keypresses,
                    0
                  );

                  return `<div style="${tooltipStyles}" class="custom-tooltip">
                    <div style="${divStyles}"><b>Employee ID:</b> ${user.empid}</div>
                    <div style="${divStyles}"><b>Name:</b> ${user.firstname} ${user.lastname}</div>
                    <div style="${divStyles}"><b>Email:</b> ${user.email}</div>
                    <div style="${divStyles}"><b>Mouse Clicks:</b> ${totalClicks.toLocaleString()}</div>
                    <div style="${divStyles}"><b>Keypresses:</b> ${totalKeyPresses.toLocaleString()}</div>
                    <div style="${divStyles}"><b>This week Session:</b> ${formatTime(weeklyHours[dataPointIndex])} </div>
                  </div>`;
                },
              },
            };

            this.series = [
              {
                name: "This Week Session",
                data: weeklyHours,
              },
            ];
          } else if (value == "3") {
            const categories: string[] = [];
            const totalClicks: number[] = [];
            const totalKeyPresses: number[] = [];
            const monthlyHours: number[] = [];

            userData.forEach((user: any) => {
              if (user.lastWorkStatus.length > 0) {
                const categoryLabel = `${user.empid} (${user.firstname} ${user.lastname.charAt(0)})`;
                categories.push(categoryLabel);

                const clicks = user.lastWorkStatus.reduce(
                  (total: any, status: { mouseclicks: any }) =>
                    total + status.mouseclicks,
                  0
                );
                const keyPresses = user.lastWorkStatus.reduce(
                  (total: any, status: { keypresses: any }) =>
                    total + status.keypresses,
                  0
                );

                const monthlyMinutes = user.lastWorkStatus.length * 10;
                const monthlyHoursCalc = monthlyMinutes / 60;
                const parseHours = parseFloat(monthlyHoursCalc.toFixed(2));

                totalClicks.push(clicks);
                totalKeyPresses.push(keyPresses);
                monthlyHours.push(parseHours);
              } else {
                const categoryLabel = `${user.empid} (${user.firstname} ${user.lastname.charAt(0)})`;
                categories.push(categoryLabel);

                const clicks = user.lastWorkStatus.reduce(
                  (total: any, status: { mouseclicks: any }) =>
                    total + status.mouseclicks,
                  0
                );
                const keyPresses = user.lastWorkStatus.reduce(
                  (total: any, status: { keypresses: any }) =>
                    total + status.keypresses,
                  0
                );

                totalClicks.push(clicks);
                totalKeyPresses.push(keyPresses);
                monthlyHours.push(0);
              }
            });

            this.options = {
              chart: {
                type: "bar",
                height: 458,
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: "20%",
                },
              },
              dataLabels: {
                enabled: false,
              },
              xaxis: {
                type: "category",
                categories: categories,
                labels: {
                  show: true,
                },
              },
              yaxis: {
                labels: {
                  show: true,
                },
              },
              tooltip: {
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                  const user = userData[dataPointIndex];

                  // Calculate total clicks and key presses
                  const totalClicks = user.lastWorkStatus.reduce(
                    (total: any, status: { mouseclicks: any }) =>
                      total + status.mouseclicks,
                    0
                  );
                  const totalKeyPresses = user.lastWorkStatus.reduce(
                    (total: any, status: { keypresses: any }) =>
                      total + status.keypresses,
                    0
                  );

                  return `<div style="${tooltipStyles}" class="custom-tooltip">
                    <div style="${divStyles}"><b>Employee ID:</b> ${user.empid}</div>
                    <div style="${divStyles}"><b>Name:</b> ${user.firstname} ${user.lastname}</div>
                    <div style="${divStyles}"><b>Email:</b> ${user.email}</div>
                    <div style="${divStyles}"><b>Mouse Clicks:</b> ${totalClicks.toLocaleString()}</div>
                    <div style="${divStyles}"><b>Keypresses:</b> ${totalKeyPresses.toLocaleString()}</div>
                    <div style="${divStyles}"><b>This Month Session:</b> ${formatTime(monthlyHours[dataPointIndex])} </div>
                  </div>`;
                },
              },
            };

            this.series = [
              {
                name: "This Month Session",
                data: monthlyHours,
              },
            ];
          }
        } else {
          this.options = {
            chart: {
              type: "bar",
              height: 458,
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: "20%",
              },
            },
            dataLabels: {
              enabled: false,
            },
            xaxis: {
              type: "category",
              categories: ["No Data Available"],
              labels: {
                show: true,
              },
            },
            yaxis: {
              labels: {
                show: true,
              },
            },
          };

          this.series = [
            {
              name: "No Data Available",
              data: [0],
            },
          ];
        }
      }
      this._cdr.detectChanges();
    });
    this.toChanged = false;
  }
}
