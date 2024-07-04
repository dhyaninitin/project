import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours
} from 'date-fns';
import { Subject } from 'rxjs';
import { OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AvailabilityModule } from './availability.module';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';
import * as moment from 'moment';

const colors: any = {
  red: {
    primary: '#1b4587',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {
  @ViewChild('availabilityModal', { static: false })
  public availabilityModal: ModalDirective;
  availabilityInfo: any = {
    available: false,
    start: new Date(),
    _id: ''
  };
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: any = [];

  activeDayIsOpen: boolean = false;

  constructor() {}
  ngOnInit() {
    for (let index = 0; index < 31; index++) {
      this.events.push({
        _id: Math.floor(100000 + Math.random() * 900000),
        start: startOfDay(
          moment()
            .add(index, 'days')
            .format('MM/DD/YYYY')
        ),
        title:  'TIME : ' + moment('10:00 AM', 'hh:mm A').format('hh:mm A') + ' - ' + moment('07:00 PM', 'hh:mm A').format('hh:mm A'),
        available: true,
        color: colors.primary
      });
    }
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (!events.length) {
      this.availabilityInfo.available = false;
      this.availabilityInfo.start = date;
      this.availabilityInfo._id = '';
      this.availabilityModal.show();
    } else {
      this.availabilityInfo = JSON.parse(JSON.stringify(events[0]));
      this.availabilityModal.show();
    }
    // console.log('date============',date);
    // console.log('events============',events);
    /*  if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    } */
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.availabilityModal.show();
  }

  addEvent(data): void {
    console.log('data===========', data);
    if (!data._id && data.available) {
      // tslint:disable-next-line: prefer-const
      let _id = Math.floor(100000 + Math.random() * 900000);
      this.events = [
        ...this.events,
        {
          _id: _id,
          title:  'TIME : ' + moment('10:00 AM', 'hh:mm A').format('hh:mm A') + ' - ' + moment('07:00 PM', 'hh:mm A').format('hh:mm A'),
          start: startOfDay(data.start),
          color: colors.primary,
          available: data.available,
          draggable: true,
          resizable: {
            beforeStart: true,
            afterEnd: true
          }
        }
      ];
    } else if (data._id && !data.available) {
      /*   var found = this.events.filter(obj => {
          return obj._id == data._id;
        });
        if (found.length) {
          var index = this.events.indexOf(found[0]);
          this.events.splice(index, 1);
        } */
      this.events = this.events.filter(event => event._id !== data._id);
    }
    this.closeModel();
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  closeModel() {
    this.availabilityModal.hide();
  }
}
