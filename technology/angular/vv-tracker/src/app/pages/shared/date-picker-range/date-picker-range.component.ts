import {
  Component,
  OnInit,
  ViewChild,
  Input,
  OnDestroy,
  Optional,
  Self,
  ElementRef,
  ViewEncapsulation,
  Renderer2,
  ChangeDetectionStrategy,
} from "@angular/core";

import {
  FormBuilder,
  FormGroup,
  FormControl,
  ControlValueAccessor,
  NgControl,
} from "@angular/forms";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { FocusMonitor } from "@angular/cdk/a11y";
import { MatFormFieldControl } from "@angular/material/form-field";
import { MatCalendar } from "@angular/material/datepicker";
import { Subject } from "rxjs";
import { delay, startWith } from "rxjs/operators";

@Component({
  selector: "vex-date-picker-range",
  templateUrl: "./date-picker-range.component.html",
  styleUrls: ["./date-picker-range.component.scss"],
  encapsulation: ViewEncapsulation.None,

  providers: [
    { provide: MatFormFieldControl, useExisting: DatePickerRangeComponent },
  ],
  host: {
    "[id]": "id",
    "[attr.aria-describedby]": "describedBy",
  },
})
  export class DatePickerRangeComponent implements OnInit, ControlValueAccessor {
    _dateFrom: number;
    _dateTo: number;

    get dateFrom() {
      return this._dateFrom ? new Date(this._dateFrom) : null;
    }
    get dateTo() {
      return this._dateTo ? new Date(this._dateTo) : null;
    }
    set dateFrom(value) {
      this._dateFrom = value ? value.getTime() : 0;

      this.value = { from: this.dateFrom, to: this.dateTo };
    }
    set dateTo(value) {
      this._dateTo = value ? value.getTime() : 0;
      this.value = { from: this.dateFrom, to: this.dateTo };
    }
    cells: any[];
    separator: string;
    order: number[] = [];

    @ViewChild(MatCalendar, { static: false }) calendar: MatCalendar<any>;

    onChange = (_: any) => {};
    onTouched = () => {};

    focused = false;
    get errorState() {
      return this.ngControl
        ? this.ngControl.invalid && this.ngControl.touched
        : false;
    }

    @Input()
    get disabled(): boolean {
      return this._disabled;
    }
    set disabled(value: boolean) {
      this._disabled = coerceBooleanProperty(value);
    }
    private _disabled = false;

    _value: any;
    dateOver: any;
    @Input()
    get value(): any | null {
      return this._value;
    }
    set value(value: any | null) {
      this._value = value;
      this.onChange(value);
    }

    /*Function give class to the calendar*/
    setClass() {
      return (date: any) => {
        if (date.getDate() == 1) this.setCells();
        const time = new Date(
          date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
        ).getTime();
        let classCss = "";
        if (time >= this._dateFrom && time <= this._dateTo) {
          classCss = "inside";
          if (time == this._dateFrom) classCss += " from";
          if (time == this._dateTo) classCss += " to";
        }
        return classCss;
      };
    }
    
    constructor(
      private renderer: Renderer2,
      private _elementRef: ElementRef<HTMLElement>,
      @Optional() @Self() public ngControl: NgControl
    ) {
      if (this.ngControl != null) {
        this.ngControl.valueAccessor = this;
      }
    }
    /*Methods implements ControlValueAccessor and MatFormFieldControl<any[]>*/

    writeValue(value: any | null): void {
      this._dateFrom = value ? value.from : null;
      this._dateTo = value ? value.to : null;
      setTimeout(() => {
        this.onOpen();
      });
    }

    registerOnChange(fn: any): void {
      this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
      this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
      this.disabled = isDisabled;
    }

    change(value, key) {
      this.onTouched();
    }

    /*Methods componetn itself*/
    ngOnInit() {
      if (this._dateFrom) this.dateFrom = new Date(this._dateFrom);
      if (this._dateTo) this.dateTo = new Date(this._dateTo);
    }
    select(date: any) {
      if (this._disabled) return;
      date = new Date(
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
      );
      if (this._dateFrom > date.getTime() || this.dateTo) {
        this.dateFrom = date;
        this.dateTo = null;
        this.redrawCells(date.getTime());
      } else {
        this.dateTo = date;
      }
    }
    setCells() {
      setTimeout(() => {
        if (this.cells) {
          this.cells.forEach((x) => {
            x.listen();
          });
        }
        this.dateOver = null;
        let elements = document.querySelectorAll(".calendar");
        if (!elements || elements.length == 0) return;
        const cells = elements[0].querySelectorAll(".mat-calendar-body-cell");
        this.cells = [];
        cells.forEach((x, index) => {
          const date = new Date(x.getAttribute("aria-label"));
          const time = new Date(
            date.getFullYear() +
              "-" +
              (date.getMonth() + 1) +
              "-" +
              date.getDate()
          ).getTime();
          this.cells.push({
            date: time,
            element: x,
            change: time >= this._dateFrom && time <= this._dateTo,
          });
        });
        this.cells.forEach((x) => {
          if (!x.listen) {
            x.listen = this.renderer.listen(x.element, "mouseover", () => {
              if (!this._dateTo && this.dateOver != x.date) {
                this.dateOver = x.date;
                this.redrawCells(this.dateOver);
              }
            });
          }
        });
      });
    }
    onOpen() {
      if (this._dateFrom) {
        const date = new Date(this._dateFrom);
        if (
          this.calendar &&
          this._dateFrom &&
          this.calendar.activeDate.getMonth() != date.getMonth()
        )
          this.calendar.activeDate = date;
      }
      this.setCells();
    }
    redrawCells(timeTo: number) {
      timeTo = timeTo || this._dateTo;
      if (timeTo < this._dateFrom) timeTo = this._dateFrom;
      this.cells.forEach((x) => {
        const change =
          this._dateFrom && x.date >= this._dateFrom && x.date <= timeTo;
        if (change || x.change) {
          x.change = change;
          const addInside = x.change ? "addClass" : "removeClass";
          const addFrom =
            x.date == this._dateFrom
              ? "addClass"
              : x.date == timeTo && this._dateFrom == timeTo
              ? "addClass"
              : "removeClass";
          const addTo =
            x.date == timeTo
              ? "addClass"
              : x.date == this._dateFrom && this._dateFrom == timeTo
              ? "addClass"
              : "removeClass";

          this.renderer[addInside](x.element, "inside");
          this.renderer[addFrom](x.element, "from");
          this.renderer[addTo](x.element, "to");
        }
      });
    }
  }
