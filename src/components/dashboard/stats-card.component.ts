
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      
      <!-- Icon Bg -->
      <div [class]="'absolute right-0 top-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ' + decorBgClass"></div>

      <div class="flex justify-between items-start mb-4">
        <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center transition-colors ' + iconBgClass">
           <span [class]="'material-icons text-xl ' + iconColorClass">{{ icon }}</span>
        </div>
        @if (trend) {
           <div class="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full" 
            [ngClass]="trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
             <span class="material-icons text-[14px]">{{ trend > 0 ? 'arrow_upward' : 'arrow_downward' }}</span>
             {{ trend > 0 ? '+' : ''}}{{ trend }}%
           </div>
        }
      </div>

      <div class="relative z-10">
         <h3 class="text-2xl font-bold text-slate-800 tracking-tight">{{ value }}</h3>
         <p class="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">{{ title }}</p>
      </div>
    </div>
  `
})
export class StatsCardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() trend?: number;
  @Input() icon!: string;
  @Input() color: 'blue' | 'green' | 'orange' | 'purple' = 'blue';

  get iconBgClass() {
    const map = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      orange: 'bg-orange-50',
      purple: 'bg-purple-50'
    };
    return map[this.color];
  }

  get iconColorClass() {
    const map = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600'
    };
    return map[this.color];
  }

  get decorBgClass() {
    const map = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      orange: 'bg-orange-600',
      purple: 'bg-purple-600'
    };
    return map[this.color];
  }
}
