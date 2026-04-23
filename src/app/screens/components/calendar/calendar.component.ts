import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: { title: string; color: string }[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pb-10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Calendar</h2>
        <button class="btn btn-primary btn-sm">+ New Event</button>
      </div>

      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <!-- Month navigation -->
          <div class="flex justify-between items-center mb-4">
            <button class="btn btn-ghost btn-sm" (click)="prevMonth()">‹ Prev</button>
            <h3 class="text-lg font-semibold">{{ monthName }} {{ year }}</h3>
            <button class="btn btn-ghost btn-sm" (click)="nextMonth()">Next ›</button>
          </div>

          <!-- Day headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            @for (day of dayNames; track day) {
              <div class="text-center text-xs font-semibold text-base-content/50 py-1">{{ day }}</div>
            }
          </div>

          <!-- Calendar grid -->
          <div class="grid grid-cols-7 gap-1">
            @for (day of calendarDays; track $index) {
              <div class="min-h-20 p-1 rounded-lg border border-transparent hover:border-base-300 cursor-pointer transition-colors"
                [class.bg-primary]="day.isToday"
                [class.text-primary-content]="day.isToday"
                [class.opacity-40]="!day.isCurrentMonth">
                <div class="text-sm font-medium mb-1">{{ day.date }}</div>
                @for (event of day.events; track event.title) {
                  <div class="text-xs px-1 py-0.5 rounded truncate text-white mb-0.5"
                    [style]="'background-color: ' + event.color">
                    {{ event.title }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Upcoming events -->
      <div class="card bg-base-100 shadow mt-4">
        <div class="card-body">
          <h3 class="card-title text-base">Upcoming Events</h3>
          <div class="flex flex-col gap-3">
            @for (event of upcomingEvents; track event.title) {
              <div class="flex items-center gap-4 p-3 rounded-lg bg-base-200">
                <div class="w-1 h-12 rounded-full" [style]="'background-color:' + event.color"></div>
                <div class="flex-1">
                  <p class="font-medium">{{ event.title }}</p>
                  <p class="text-sm text-base-content/60">{{ event.date }} · {{ event.time }}</p>
                </div>
                <div class="badge" [style]="'background-color:' + event.color + '30; color:' + event.color">{{ event.type }}</div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];
  monthName = '';
  year = 0;
  private currentDate = new Date();

  upcomingEvents = [
    { title: 'Team Standup', date: 'Dec 18', time: '09:00 AM', color: '#6366F1', type: 'Meeting' },
    { title: 'Product Launch', date: 'Dec 20', time: '02:00 PM', color: '#EC4899', type: 'Event' },
    { title: 'Q4 Review', date: 'Dec 28', time: '10:00 AM', color: '#F59E0B', type: 'Meeting' },
    { title: 'New Year Planning', date: 'Jan 3', time: '11:00 AM', color: '#10B981', type: 'Planning' },
  ];

  ngOnInit(): void { this.generateCalendar(); }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    this.year = year;
    this.monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    this.calendarDays = [];

    // Prev month padding
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({ date: prevDays - i, isToday: false, isCurrentMonth: false, events: [] });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const events: { title: string; color: string }[] = [];
      if (d === 18) events.push({ title: 'Team Standup', color: '#6366F1' });
      if (d === 20) events.push({ title: 'Product Launch', color: '#EC4899' });
      if (d === 25) events.push({ title: 'Christmas', color: '#10B981' });
      this.calendarDays.push({ date: d, isToday, isCurrentMonth: true, events });
    }

    // Next month padding
    const remaining = 42 - this.calendarDays.length;
    for (let d = 1; d <= remaining; d++) {
      this.calendarDays.push({ date: d, isToday: false, isCurrentMonth: false, events: [] });
    }
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }
}
