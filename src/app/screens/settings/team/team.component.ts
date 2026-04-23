import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pb-10">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Team Members</h2>
        <button class="btn btn-primary btn-sm">+ Invite Member</button>
      </div>

      <div class="card bg-base-100 shadow">
        <div class="card-body p-0">
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (member of members; track member.email) {
                  <tr class="hover">
                    <td>
                      <div class="flex items-center gap-3">
                        <div class="avatar">
                          <div class="w-10 rounded-full">
                            <img [src]="member.avatar" [alt]="member.name" />
                          </div>
                        </div>
                        <div>
                          <p class="font-medium">{{ member.name }}</p>
                          <p class="text-sm text-base-content/60">{{ member.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="badge badge-ghost badge-sm">{{ member.role }}</div>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div
                          class="w-2 h-2 rounded-full"
                          [class]="member.online ? 'bg-success' : 'bg-base-300'"
                        ></div>
                        <span class="text-sm">{{ member.online ? 'Online' : 'Offline' }}</span>
                      </div>
                    </td>
                    <td class="text-sm text-base-content/60">{{ member.joined }}</td>
                    <td>
                      <div class="dropdown dropdown-end">
                        <label tabindex="0" class="btn btn-ghost btn-xs">···</label>
                        <ul
                          tabindex="0"
                          class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36"
                        >
                          <li><a>Edit Role</a></li>
                          <li><a class="text-error">Remove</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TeamComponent {
  members = [
    {
      name: 'John Doe',
      email: 'john@Central do AssinanteP.com',
      role: 'Admin',
      online: true,
      joined: 'Jan 2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john&backgroundColor=b6e3f4',
    },
    {
      name: 'Sarah Connor',
      email: 'sarah@Central do AssinanteP.com',
      role: 'Developer',
      online: true,
      joined: 'Mar 2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=ffd5dc',
    },
    {
      name: 'Mike Johnson',
      email: 'mike@Central do AssinanteP.com',
      role: 'Designer',
      online: false,
      joined: 'Jun 2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike&backgroundColor=d1fae5',
    },
    {
      name: 'Emma Wilson',
      email: 'emma@Central do AssinanteP.com',
      role: 'Marketing',
      online: true,
      joined: 'Aug 2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma&backgroundColor=ede9fe',
    },
    {
      name: 'Carlos Silva',
      email: 'carlos@Central do AssinanteP.com',
      role: 'Sales',
      online: false,
      joined: 'Oct 2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos&backgroundColor=fef3c7',
    },
  ];
}
