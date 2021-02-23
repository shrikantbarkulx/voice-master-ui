import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";

import { RecordRTCService } from "../../../services/record.service";
import { SenseService } from "../../../services/sense.service";
import { CustomerService } from "../../../services/customer.service";
import { Customer } from "../../../classes/customer.model";
import { CustomerSample } from "../../../classes/customer-sample";



@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  registerOpen = false;

  @ViewChild("f", { static: false })
  signupForm!: NgForm;

  user: Customer = {
    fname: "",
    lname: "",
    email: "",
    secretCode: "",
  };

  isRecording = false;
  blobUrl = this.recordRTCService?.blobUrl;
  recordTimer = this.recordRTCService?.recordingTimer;
  micAccess$ = this.senseService.hasMicrofonAccess$;
  voiceSamples: CustomerSample[] = [];

  constructor(
    private domSanitizer: DomSanitizer,
    public recordRTCService: RecordRTCService,
    private senseService: SenseService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {}


  toggleRegister() {
		this.registerOpen = !this.registerOpen;
    this.customerService.isRegisterOpen$.next(this.registerOpen);
	}

  onCancel() {
    this.signupForm.reset();
    this.registerOpen = !this.registerOpen;
    this.customerService.isRegisterOpen$.next(this.registerOpen);
  }

  registerUser() {
    this.user = {
      fname: this.signupForm.value.userData.firstName,
      lname: this.signupForm.value.userData.lastName,
      email: this.signupForm.value.userData.email,
      secretCode: this.signupForm.value.userData.secret,
    };
    console.log(this.user);
    this.customerService.register(this.user).subscribe(
      (response) => {
        console.log(response);
        alert(
          `User ${this.user.fname} ${this.user.lname} is register successfully.`
        );
      },
      (error) => {
        const data = error.error["data"];
        const userId = data["userId"];
        console.log(userId);
        if (userId) {
          this.fetchUserSamples(userId);
        } else {
          alert(error["description"]);
        }
      }
    );
  }

  fetchUserSamples(userId: number): any {
    this.customerService.fetchCustomers(userId).subscribe(
      (data) => {
        console.log(data);
        // this.voiceSamples = data;
        console.log("this.voiceSamples:::::::::::"+ this.voiceSamples);
      },
      (error) => {
        console.log(error["description"]);
        alert(error["description"]);
      }
    );
  }

  startRecording() {
    this.isRecording = true;
    this.recordRTCService.toggleRecord();
    console.log("Recording Started.");
  }

  stopRecording() {
    this.isRecording = false;
    this.recordRTCService.toggleRecord();
    console.log("Recording Stopped.");
  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
}