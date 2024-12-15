import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mean-app';
  registrationData = {
    fullName: '',
    aadhaarNumber: '',
    dob: '',
    address: {
      area: '',
      city: '',
      state: '',
      country: ''
    },
    gotra: '',
    maritalStatus: ''
  };

  relationData = {
    personAadhaar: '',
    relativeAadhaar: '',
    relationType: '',
    isAlive: true
  };

  constructor(private http: HttpClient) {}

  registerUser() {
    this.http.post('http://localhost:3000/api/register', this.registrationData).subscribe(
      response => console.log('User Registered:', response),
      error => console.error('Registration Error:', error)
    );
  }

  addRelation() {
    this.http.post('http://localhost:3000/api/add-relation', this.relationData).subscribe(
      response => console.log('Relation Added:', response),
      error => console.error('Relation Error:', error)
    );
  }

  searchUser(aadhaarNumber: string) {
    this.http.get(`http://localhost:3000/api/search-user/${aadhaarNumber}`).subscribe(
      response => console.log('User Found:', response),
      error => console.error('Search Error:', error)
    );
  }
}
