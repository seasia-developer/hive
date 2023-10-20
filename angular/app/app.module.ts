import { BrowserModule, HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { GoogleAPIService } from "./services/googleApi.service";
import { HttpClientModule } from "@angular/common/http";
import { ToastrModule } from "ngx-toastr";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { DragScrollModule } from "cdk-drag-scroll";
import { GestureConfig } from "@angular/material";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireModule } from "@angular/fire";
import { MessagingService } from "./services/messaging.service";
import { MsalModule } from "@azure/msal-angular";
import { ParentModule } from "./modules/application/home/content/parent/parent.module";
import { environment } from "src/environments/environment";
import { WebformTestComponent } from './modules/webform-test/webform-test.component';
import { SocketService } from './services/socketio.service';
// import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
// import { MSALService } from './services/msal.service';
import { MentionModule } from "angular-mentions";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import {VgCoreModule} from 'videogular2/compiled/core';
import {VgControlsModule} from 'videogular2/compiled/controls';
import {VgOverlayPlayModule} from 'videogular2/compiled/overlay-play';
import {VgBufferingModule} from 'videogular2/compiled/buffering';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AngularFireAuth } from '@angular/fire/auth';

import {BrowserAnimationsModule} from 
    '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule } 
from '@angular/material';
import { ServiceWorkerModule } from "@angular/service-worker";


// For Google API configuration
export function initGapi(gapiSession: GoogleAPIService) {
  return () => gapiSession.initClient();
}

// For MSAL configuration
export const protectedResourceMap: [string, string[]][] = [
  ["https://graph.microsoft.com/v1.0/me", ["user.read"]]
];
const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

// const config: SocketIoConfig = { url: 'http://localhost:5000/', options: {} };
@NgModule({
  declarations: [
    AppComponent,
    WebformTestComponent
    // OrganisationSetupComponent
  ],
  imports: [
    // SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    FormsModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    MentionModule,
    DragDropModule,
    DragScrollModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NoopAnimationsModule,
    HttpClientModule,
    MatTooltipModule,
    ServiceWorkerModule.register('ngsw-worker.js',
    {
      enabled: environment.production,
      registrationStrategy:  "registerImmediately"

    }),
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: "toast-top-right",
      preventDuplicates: false,
      closeButton: true,
      progressBar: true
    }),
    ParentModule,
    // Microsoft Authentication library configuration
    MsalModule.forRoot({
      auth: {
        clientId: environment.oneDriveClientId,
        authority: "https://login.microsoftonline.com/common/",
        redirectUri: environment.redirectUri,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false, // Set to true for Internet Explorer 11
      },
      system: {
        loadFrameTimeout: 30000,
      }
    }, {
      popUp: !isIE,
      consentScopes: [
        "user.read",
        "openid",
        "profile",
      ],
      unprotectedResources: [],
      protectedResourceMap: [
        ["https://graph.microsoft.com/v1.0/me", ["user.read"]]
      ],
      extraQueryParameters: {}
    }),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebase),
  ],
  providers: [
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    { provide: APP_INITIALIZER, useFactory: initGapi, deps: [GoogleAPIService], multi: true },
    GoogleAPIService,
    MessagingService,
    SocketService
    // MSALService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    // OrganisationSetupComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
