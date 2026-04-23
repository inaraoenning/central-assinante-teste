import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pb-10">
      <h2 class="text-2xl font-bold mb-6">Profile Settings</h2>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Profile card -->
        <div class="card bg-base-100 shadow">
          <div class="card-body items-center text-center">
            <div class="avatar">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Central do AssinanteP&backgroundColor=b6e3f4"
                  alt="Avatar"
                />
              </div>
            </div>
            <h3 class="text-lg font-bold mt-3">John Doe</h3>
            <p class="text-sm text-base-content/60">admin&#64;Central do AssinanteP.com</p>
            <div class="badge badge-primary">Administrator</div>
            <button class="btn btn-outline btn-sm mt-3 w-full">Change Photo</button>
          </div>
        </div>

        <!-- Settings form -->
        <div class="card bg-base-100 shadow lg:col-span-2">
          <div class="card-body">
            <h3 class="card-title text-base mb-4">Personal Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text">First Name</span></label>
                <input type="text" [(ngModel)]="firstName" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Last Name</span></label>
                <input type="text" [(ngModel)]="lastName" class="input input-bordered" />
              </div>
              <div class="form-control col-span-2">
                <label class="label"><span class="label-text">Email</span></label>
                <input type="email" [(ngModel)]="email" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Phone</span></label>
                <input type="tel" [(ngModel)]="phone" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Location</span></label>
                <input type="text" [(ngModel)]="location" class="input input-bordered" />
              </div>
              <div class="form-control col-span-2">
                <label class="label"><span class="label-text">Bio</span></label>
                <textarea [(ngModel)]="bio" class="textarea textarea-bordered h-20"></textarea>
              </div>
            </div>
            <div class="card-actions justify-end mt-4">
              <button class="btn btn-ghost">Cancel</button>
              <button class="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="card bg-base-100 shadow lg:col-span-3">
          <div class="card-body">
            <h3 class="card-title text-base mb-4">Security</h3>
            <div class="grid lg:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text">Current Password</span></label>
                <input type="password" placeholder="••••••••" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">New Password</span></label>
                <input type="password" placeholder="••••••••" class="input input-bordered" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">Confirm Password</span></label>
                <input type="password" placeholder="••••••••" class="input input-bordered" />
              </div>
            </div>
            <div class="card-actions justify-end mt-4">
              <button class="btn btn-primary">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  firstName = 'John';
  lastName = 'Doe';
  email = 'admin@Central do AssinanteP.com';
  phone = '+1 (555) 000-1234';
  location = 'San Francisco, CA';
  bio = 'Full-stack developer and product enthusiast. Building things that matter.';
}
