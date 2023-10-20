import { Component, OnInit, AfterViewInit } from "@angular/core";
import * as moment from "moment";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { MsalService } from "@azure/msal-angular";

import { HelperService } from "src/app/services/helper.service";
import { OrganisationSetupComponent } from "../../organisation-setup/organisation-setup.component";
import { HomeService } from "../../../home.service";
import { ParentService } from "../../parent/parent.service";
import { GoogleAPIService } from "src/app/services/googleApi.service";
import { Constants } from "src/app/constants/constants";
import { AppViewService } from "../../../application-view/application-view.service";
import { environment } from "src/environments/environment";
import { constants } from 'os';
import { _ } from 'ag-grid-community';

@Component({
  selector: "app-upload-org-content",
  templateUrl: "./upload-org-content.component.html",
  styleUrls: ["./upload-org-content.component.scss"],
})
export class UploadOrgContentComponent implements OnInit, AfterViewInit {
  imagePreview = [];
  orgImageData: any;
  isEditOrg;
  bsmodalRef: BsModalRef;
  caller = "addOrg";
  uploadType = "single";
  showPreview = false;

  // Drive related variables
  imageMimes = Constants.IMAGE_MIMES;
  driveCredentials: any = { google: [], oneDrive: [], dropbox: [] };
  currentFiles = [];
  previousDirectory = "root";
  currentDirectory = "root";
  directories = [];
  driveType = "";
  selectedImages = [];
  selectedImageIds = [];
  showButton: boolean;
  pcImages: any[];
  showProgress: boolean;
  progress: number;
  dropboxClientId = environment.dropboxClientId;
  redirectUri = environment.redirectUri;
  initializeDbx = false;
  // tslint:disable-next-line: max-line-length
  dropboxUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${this.dropboxClientId}&response_type=code&redirect_uri=${this.redirectUri}`;
  downloadedFiles = { files: [], preview: [] };
  acceptedFormats: any = Constants.ALLOWED_FILE_TYPES;
  openDriveAccountType = "";
  fileTypes = Constants.FILE_TYPES;

  constructor(
    private helperService: HelperService,
    private homeService: HomeService,
    private parentService: ParentService,
    private modalService: BsModalService,
    private googleApiService: GoogleAPIService,
    private authService: MsalService,
    private appViewService: AppViewService
  ) { }

  async ngOnInit() {
    if (this.homeService.addOrgModalRef) {
      this.homeService.addOrgModalRef.hide();
    }
    if (this.caller !== "addOrg") {
      this.helperService.orgImage = "";
      this.helperService.orgImagePreview = "";
    }
    this.driveCredentials = await this.parentService.getFormattedCredentials();
    this.orgImageData = this.helperService.orgImage;
    if (this.helperService.orgImagePreview) {
      this.imagePreview = [this.helperService.orgImagePreview];
    }
    if (this.initializeDbx) {
      // To open the dropbox tab when a new account is connected
      document.getElementById("dbx-tab").click();
    }
    // this.isEditOrg=this.isEditOrg;
    // this.route.queryParamMap.subscribe((params) => {
    //   this.isEditOrg = params.get("isEditOrg");
    // });
  }

  ngAfterViewInit() {
    if (this.caller === "addOrg" || this.caller === "profile" || this.caller === "business") {
      this.acceptedFormats = "image/png , image/jpeg";
    } else if (this.caller === "addOrg") {
      this.acceptedFormats = Constants.ALLOWED_FILE_TYPES_POST;
    } else {
      this.acceptedFormats = Constants.ALLOWED_FILE_TYPES;
    }
    if (this.uploadType === "multiple") {
      const inputAll = document.getElementById("pc-upload-all");
      inputAll.setAttribute("multiple", "");
      const imageInput = document.getElementById("pc-upload-image");
      imageInput.setAttribute("multiple", "");
      const noVidInput = document.getElementById("pc-upload-post");
      noVidInput.setAttribute("multiple", "");
    }
  }

  toggleDriveMenu(type) {
    if (this.openDriveAccountType === type) {
      this.openDriveAccountType = "";
    } else {
      this.openDriveAccountType = type;
    }
  }

  hideModal(level) {
    this.homeService.uploadModalRef.hide();
    if (this.caller === "addOrg") {
      this.homeService.addOrgModalRef = this.modalService.show(
        OrganisationSetupComponent,
        { class: "small-custom-modal",animated: true,
        keyboard: true,
        backdrop: false,
        ignoreBackdropClick: true }
      );
    }
  }

  async connectDrive(type = "") {
    if (type === "google") {
      await this.parentService.googleSignIn('https://www.googleapis.com/auth/drive.readonly');
    } else if (type === "oneDrive") {
      await this.parentService.odLogin();
    } else {
      const dbxObj = {
        caller: this.caller,
        uploadType: this.uploadType,
      };
      this.helperService.setLocalStore("dropboxConnection", dbxObj);
      window.open(this.dropboxUrl, "_self");
    }
    this.driveCredentials = await this.parentService.getFormattedCredentials();
    if (type === "google") {
      this.getFiles(this.driveCredentials.google[0]);
    } else if (type === "oneDrive") {
      this.getOneDriveFiles(this.driveCredentials.oneDrive[0]);
    }
  }

  changeDriveType(type = "") {
    this.showPreview = false;
    this.currentFiles = [];
    this.driveType = type;
    if (type === "google" && this.driveCredentials.google.length) {
      this.getFiles(this.driveCredentials.google[0]);
      this.currentDirectory = "root";
    } else if (type === "oneDrive" && this.driveCredentials.oneDrive.length) {
      this.getOneDriveFiles(this.driveCredentials.oneDrive[0]);
      this.currentDirectory = "";
    } else if (type === "dropbox" && this.driveCredentials.dropbox.length) {
      this.getDbxFiles(this.driveCredentials.dropbox[0]);
      this.currentDirectory = "";
    }
  }

  callFileUpload() {
    if (this.caller === "addOrg" || this.caller === "profile" || this.caller === "business") {
      document.getElementById("pc-upload-image").click();
    } else if (this.caller === "addPost") {
      document.getElementById("pc-upload-post").click();
    } else {
      document.getElementById("pc-upload-all").click();
    }
  }

  // changeToPc() {
  //   this.showPreview = false;
  //   this.currentFiles = [];
  //   this.driveType = "";
  // }
  isVideo(film, fileTypes) {
    const ext = fileTypes;
    // console.log('some',ext.some(el => film===el))
    return ext.some(el => film === el);
  }

  fileValidation(files, fileTypes) {
    const result = [];
    for (let i = 0; i < files.length; ++i) {
      let fname = files.item(i).name;
      if (!this.isVideo(files.item(i).type, fileTypes)) {
        this.helperService.showErrorToast("File extension not supported!");
      } else {
        result.push(files[i])
      }
    }
    // console.log(result)
    return result;
  }
  fileupload(event, type = "") {
    let fileData;
    // console.log('this.caller ',this.caller)
    // this.fileValidation(event.target.files)
    if (this.caller === "addOrg" || this.caller === "profile" || this.caller === "business") {
      document.getElementById("pc-upload-image").click();
      fileData = this.fileValidation(event.target.files, ["image/jpeg", "image/png", "image/bmp"])
    } else if (this.caller === "addPost") {
      document.getElementById("pc-upload-post").click();
      fileData = this.fileValidation(event.target.files, Constants.POST_FILE_TYPE);
    } else {
      document.getElementById("pc-upload-all").click();
      fileData = this.fileValidation(event.target.files, Constants.UPLOAD_TYPE);
    }
    if (this.caller === "addOrg") {
      if (!type) {
        this.orgImageData = fileData[0];
      } else {
        this.orgImageData = event.addedFiles[0];
      }
      this.helperService.orgImage = this.orgImageData;
      if (this.orgImageData) {
        this.imagePreview = [];
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview.push(e.target.result);
          this.helperService.orgImagePreview = e.target.result;
          this.helperService.updateImg = true;
        };
        reader.readAsDataURL(this.orgImageData);
      }
    } else {
      if (!this.imagePreview.length) {
        this.pcImages = [];
      }
      if (!type) {
        this.pcImages = [...this.pcImages, ...fileData];
      } else {
        this.pcImages = [...this.pcImages, ...event.addedFiles];
      }
      this.imagePreview = [];
      // this.pcImages = [...event.target.files];
      this.pcImages.forEach(file => {

        if (file.type.includes("image")) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreview.push(e.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          switch (file.type) {
            case this.fileTypes.ods:
              this.imagePreview.push("../../../../../../assets/images/file-types/Ods.svg");
              break;
            case this.fileTypes.odt:
              this.imagePreview.push("../../../../../../assets/images/file-types/Odt.svg");
              break;
            case this.fileTypes.ppt:
            case 'application/mspowerpoint':
            case 'application/powerpoint':
            case 'application/vnd.ms-powerpoint':
              this.imagePreview.push("../../../../../../assets/images/file-types/ppt.svg");
              break;
            case this.fileTypes.pptx:
            case 'application/x-mspowerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
              this.imagePreview.push("../../../../../../assets/images/file-types/Pptx.svg");
              break;
            case this.fileTypes.doc:
            case 'application/msword':
            case 'application/doc':
            case 'application/ms-doc':
            case 'application/msword':
              this.imagePreview.push("../../../../../../assets/images/file-types/Doc.svg");
              break;
            case this.fileTypes.docx:
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
              this.imagePreview.push("../../../../../../assets/images/file-types/Docx.svg");
              break;
            case this.fileTypes.xls:
            case 'application/excel':
            case 'application/vnd.ms-excel':
              this.imagePreview.push("../../../../../../assets/images/file-types/Xls.svg");
              break;
            case this.fileTypes.xlsx:
            case 'application/x-excel':
            case 'application/x-msexcel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
              this.imagePreview.push("../../../../../../assets/images/file-types/Xlsx.svg");
              break;
            case this.fileTypes.mov:
              this.imagePreview.push("../../../../../../assets/images/file-types/Mov.svg");
              break;
            case this.fileTypes.mp3:
              this.imagePreview.push("../../../../../../assets/images/file-types/Mp3.svg");
              break;
            case this.fileTypes.mp4:
              this.imagePreview.push("../../../../../../assets/images/file-types/Mp4.svg");
              break;
            case this.fileTypes.avi:
            case 'video/avi':
              this.imagePreview.push("../../../../../../assets/images/file-types/avi.svg");
              break;
            case this.fileTypes.csv:
              this.imagePreview.push("../../../../../../assets/images/file-types/Csv.svg");
              break;
            case this.fileTypes.wmv:
              this.imagePreview.push("../../../../../../assets/images/file-types/Wmv.svg");
              break;
            // case this.fileTypes.zip:
            // case "application/x-zip-compressed":
            //   this.imagePreview.push("../../../../../../assets/images/file-types/Zip.svg");
            //   break;
            case this.fileTypes.text:
              this.imagePreview.push("../../../../../../assets/images/file-types/Txt.svg");
              break;
            case this.fileTypes.pdf:
              this.imagePreview.push("../../../../../../assets/images/file-types/pdf.svg");
              break;
            default:
              this.imagePreview.push("../../../../../../assets/images/documents.svg");
              break;
          }
        }
        // } else if (file.type.includes("pdf")) {
        //   this.imagePreview.push(
        //     "../../../../../../assets/images/pdf.svg"
        //   );
        // } else {
        //   this.imagePreview.push(
        //     "../../../../../../assets/images/documents.svg"
        //   );
        // }
      });
    }
  }

  removeImage(i) {
    if (this.caller === "addOrg") {
      this.orgImageData = "";
      this.imagePreview = [];
      this.helperService.orgImage = this.orgImageData;
      this.helperService.orgImagePreview = this.imagePreview;
    } else {
      this.imagePreview.splice(i, 1);
      this.pcImages.splice(i, 1);
    }
  }

  upload() {
    if (this.caller === "addOrg") {
      if (this.helperService.orgImage) {
        if (!this.isEditOrg) {
          this.modalService.onShown.subscribe((reason: string) => {
            if (document.getElementById("name")) {
              document.getElementById("name").focus();
            }
          });
          // this.homeService.uploadModalRef.hide();
          this.homeService.addOrgModalRef = this.modalService.show(
            OrganisationSetupComponent,
            { class: "small-custom-modal",animated: true,
            keyboard: true,
            backdrop: false,
            ignoreBackdropClick: true }
          );

          // this.router.navigateByUrl("application/home/add-org");
        } else {
          let initialState = {
            isEditOrg: true,
            isLatestUploaded: true,
          };
          this.modalService.onShown.subscribe((reason: string) => {
            if (document.getElementById("name")) {
              document.getElementById("name").focus();
            }
          });
          const modalParams = Object.assign(
            {},
            { initialState, class: "small-custom-modal",animated: true,
            keyboard: true,
            backdrop: false,
            ignoreBackdropClick: true }
          );
          // this.homeService.uploadModalRef.hide();
          this.homeService.addOrgModalRef = this.modalService.show(
            OrganisationSetupComponent,
            modalParams
          );

          // this.router.navigate(["application/home/add-org"], {
          //   queryParams: { isEditOrg: true, isLatestUploaded: true },
          // });
        }
      } else {
        this.helperService.showErrorToast("Organization image is required");
      }
    } else if (this.uploadType === "multiple") {
      // For components with multiple files upload
      if (this.pcImages && this.pcImages.length) {
        if (this.caller === "addRecord") {
          this.appViewService.uploadedImages.next(this.pcImages);
        } else if (this.caller === "addTask") {
          this.homeService.taskImages.next(this.pcImages);
        } else if (this.caller === "addPost") {
          this.homeService.postImages.next(this.pcImages);
        } else if (this.caller === "addComment") {
          this.homeService.commentImages.next(this.pcImages);
        }
        this.homeService.uploadModalRef.hide();
      } else {
        this.helperService.showErrorToast("Please choose file");
      }
     
    } else {
      // For components with single file upload
      if (this.pcImages && this.pcImages.length) {
        if (this.caller === "profile") {
          this.parentService.profileImage.next(this.pcImages[0]);
        } else if (this.caller === "business") {
          this.parentService.businessAvatar.next(this.pcImages[0]);
        } else if (this.caller === "banners") {
          this.parentService.banners.next(this.pcImages[0]);
        }

      this.homeService.uploadModalRef.hide();
      } else {
        this.helperService.showErrorToast("Please choose file");
      }

    }
  }

  async selectMultiple(type) {
    const images = [];
    this.showPreview = true;
    this.showProgress = true;
    this.progress = 1;
    const interval = setInterval(() => {
      if (this.progress < 80) {
        this.progress += 1;
      }
    }, 500);
    if (type === "google") {
      for (const file of this.selectedImages) {
        let image: any = await this.downloadFile(file);
        image = new Blob([image], { type: file.mimeType });
        images.push(image);
      }
    } else if (type === "dbx") {
      for (const file of this.selectedImages) {
        // tslint:disable-next-line: max-line-length
        const fileObj = await this.parentService.dbxGetParticularFile(
          this.parentService.currentDbxUserToken.access_token,
          file.path_display
        );
        const image: any = await this.downloadDbxFile(fileObj);
        images.push(image);
      }
    } else {
      for (const file of this.selectedImages) {
        const image: any = await this.getParticularFile(
          this.parentService.currentOdUserToken.token.accessToken,
          file.id
        );
        images.push(image);
      }
    }
    clearInterval(interval);
    for (let i = this.progress; i <= 100; i++) {
      setTimeout(() => {
        this.progress = i;
        if (this.progress === 100) {
          this.showProgress = false;
          this.downloadedFiles.files = images;
          images.forEach((image) => {
            if (image.type.includes("image")) {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                this.downloadedFiles.preview.push(e.target.result);
              };
              reader.readAsDataURL(image);
            } else {
              switch (image.type) {
                case this.fileTypes.ods:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Ods.svg");
                  break;
                case this.fileTypes.odt:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Odt.svg");
                  break;
                case this.fileTypes.ppt:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/ppt.svg");
                  break;
                case this.fileTypes.pptx:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Pptx.svg");
                  break;
                case this.fileTypes.doc:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Doc.svg");
                  break;
                case this.fileTypes.docx:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Docx.svg");
                  break;
                case this.fileTypes.xls:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Xls.svg");
                  break;
                case this.fileTypes.xlsx:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Xlsx.svg");
                  break;
                case this.fileTypes.mov:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Mov.svg");
                  break;
                case this.fileTypes.mp3:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Mp3.svg");
                  break;
                case this.fileTypes.mp4:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Mp4.svg");
                  break;
                case this.fileTypes.avi:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/avi.svg");
                  break;
                case this.fileTypes.csv:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Csv.svg");
                  break;
                case this.fileTypes.wmv:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Wmv.svg");
                  break;
                // case this.fileTypes.zip:
                //   this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Zip.svg");
                //   break;
                case this.fileTypes.text:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/Txt.svg");
                  break;
                case this.fileTypes.pdf:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/file-types/pdf.svg");
                  break;
                default:
                  this.downloadedFiles.preview.push("../../../../../../assets/images/documents.svg");
                  break;
              }
            }
            // if (image.type.includes("image")) {
            //   const reader = new FileReader();
            //   reader.onload = (e: any) => {
            //     this.downloadedFiles.preview.push(e.target.result);
            //   };
            //   reader.readAsDataURL(image);
            // } else if (image.type.includes("pdf")) {
            //   this.downloadedFiles.preview.push(
            //     "../../../../../../assets/images/pdf.svg"
            //   );
            // } else {
            //   this.downloadedFiles.preview.push(
            //     "../../../../../../assets/images/documents.svg"
            //   );
            // }
          });
          // this.homeService.uploadModalRef.hide();
          // if (this.caller === "addRecord") {
          //   this.appViewService.uploadedImages.next(images);
          // } else if (this.caller === "addTask") {
          //   this.homeService.taskImages.next(images);
          // }
        }
      }, 0);
    }
  }

  removeDownloadedImage(ind) {
    this.downloadedFiles.files.splice(ind, 1);
    this.downloadedFiles.preview.splice(ind, 1);
  }

  uploadMultiple(images) {
    this.homeService.uploadModalRef.hide();
    if (this.caller === "addRecord") {
      this.appViewService.uploadedImages.next(images);
    } else if (this.caller === "addTask") {
      this.homeService.taskImages.next(images);
    } else if (this.caller === "addPost") {
      this.homeService.postImages.next(images);
    } else if (this.caller === "addComment") {
      this.homeService.commentImages.next(images);
    }
  }

  //// Google Drive Start ////
  async getFiles(cred) {
    this.driveType = "google";
    this.openDriveAccountType = "";
    this.currentFiles = [];
    this.selectedImages = [];
    this.selectedImageIds = [];
    this.showPreview = false;
    if (moment(cred.updatedAt).add(1, "hour").isBefore(moment())) {
      const updatedCred = await this.gapiRefreshExpiredToken(cred, 'https://www.googleapis.com/auth/drive.readonly');
      this.getFiles(updatedCred);
    } else {
      this.googleApiService.authorize(cred.token);
      const fileObj: any = await this.googleApiService.getFiles("root");
      this.currentFiles = fileObj.result.files;
    }
    // To reset previous and current directories
    this.previousDirectory = "root";
    this.currentDirectory = "root";
  }

  gapiRefreshExpiredToken(cred, scope) {
    return new Promise(async (resolve, reject) => {
      const updatedCred = await this.parentService.refreshExpiredGoogleToken(
        cred, scope
      );
      this.parentService.updateCredential(updatedCred);
      resolve(updatedCred);
    });
  }

  async openFolderOrFile(item, type = "") {
    if (item.mimeType.includes("folder")) {
      const fileObj: any = await this.googleApiService.getFiles(item.id);
      this.currentFiles = fileObj.result.files;
      // To update the track of directories
      this.previousDirectory = this.currentDirectory;
      this.currentDirectory = item.id;
      if (!this.directories.find((el) => el.directory === item.id)) {
        this.directories.push({
          directory: item.id,
          previousDirectory: this.previousDirectory,
        });
      }
    } else {
      if (this.caller === "addOrg") {
        const image: any = await this.downloadFile(item);
        this.helperService.orgImage = new Blob([image], {
          type: item.mimeType,
        });
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.helperService.orgImagePreview = e.target.result;
          this.helperService.orgImage.name = item.name;
          this.helperService.updateImg = true;
          this.upload();
        };
        reader.readAsDataURL(this.helperService.orgImage);
      } else if (this.uploadType === "multiple") {
        // For components with multiple files upload
        // if (!this.showButton) {
        //   this.showButton = true;
        //   // document.getElementById("google-upload").hidden = false;
        // }
        if (!this.selectedImageIds.includes(item.id)) {
          this.selectedImages.push(item);
          this.selectedImageIds.push(item.id);
        } else {
          this.selectedImages.splice(
            this.selectedImages.findIndex((img) => img.id === item.id),
            1
          );
          this.selectedImageIds.splice(
            this.selectedImageIds.indexOf(item.id),
            1
          );
          // if (!this.selectedImageIds.length) {
          //   this.showButton = false;
          //   // document.getElementById("google-upload").hidden = true;
          // }
        }
      } else {
        // For components with single file upload
        let image: any = await this.downloadFile(item);
        image = new Blob([image], { type: item.mimeType });
        if (this.caller === "profile") {
          this.parentService.profileImage.next(image);
        } else if (this.caller === "business") {
          this.parentService.businessAvatar.next(image);
        } else if (this.caller === "banners") {
          this.parentService.banners.next(image);
        }
      }
      // this.helperService.orgImage = new Blob( image, { type: item.mimeType } );
      // const imageData = this.http.get(image.responseUrl)
      // const file: any = await this.googleApiService.getParticularFile(item.id);
      // const formData = new FormData();
      // formData.append("name", item.name);
      // formData.append("imageData", blob);
      // await this.apiService
      //     .postWithHeader("user/generateImage", formData)
      //     .then((jresponse: JReponse) => {
      //       if (jresponse) {
      //       }
      //     })
      //     .catch((err: any) => {
      //       this.helperService.showErrorToast(err.message);
      //       throw err;
      //     });
    }
  }

  downloadFile(file, document = false) {
    return new Promise((resolve, reject) => {
      const fileId = file.id;
      const accessToken = gapi.auth.getToken().access_token;
      const xhr = new XMLHttpRequest();
      let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      if (document) {
        url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/x-vnd.oasis.opendocument.spreadsheet`;
      }
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.responseType = "arraybuffer";
      xhr.onload = () => {
        if (xhr.status === 403) {
          resolve(this.downloadFile(file, true));
        } else {
          resolve(xhr.response);
        }
      };
      xhr.send();
    });
  }

  async goToPreviousDirectory() {
    const fileObj: any = await this.googleApiService.getFiles(
      this.previousDirectory
    );
    this.currentFiles = fileObj.result.files;
    // To update the track of directories
    this.currentDirectory = this.previousDirectory;
    if (this.currentDirectory !== "root") {
      this.previousDirectory = this.directories.find(
        (el) => el.directory === this.currentDirectory
      ).previousDirectory;
    } else {
      this.previousDirectory = this.currentDirectory;
    }
  }
  //// Google Drive End ////

  //// Dropbox Start ////
  async getDbxFiles(cred, path = "") {
    this.driveType = "dropbox";
    this.openDriveAccountType = "";
    this.showPreview = false;
    this.currentFiles = [];
    if (this.previousDirectory === "root") {
      this.previousDirectory = "";
      this.currentDirectory = "";
    }
    // To reset selected Images
    this.selectedImages = [];
    this.selectedImageIds = [];
    this.parentService.currentDbxUserToken = cred.token;
    this.currentFiles = await this.parentService.dropBoxFiles(cred.token, path);
  }

  async openDbxFolderOrFile(file) {
    const tokenObj = { token: this.parentService.currentDbxUserToken };
    if (file[".tag"] === "folder") {
      this.getDbxFiles(tokenObj, file.path_display);
      this.previousDirectory = this.currentDirectory;
      this.currentDirectory = file.path_display;
      if (!this.directories.find((el) => el.directory === file.path_display)) {
        this.directories.push({
          directory: file.path_display,
          previousDirectory: this.previousDirectory,
        });
      }
    } else {
      if (this.caller === "addOrg") {
        // tslint:disable-next-line: max-line-length
        const fileObj = await this.parentService.dbxGetParticularFile(
          this.parentService.currentDbxUserToken.access_token,
          file.path_display
        );
        const image = await this.downloadDbxFile(fileObj);
        this.helperService.orgImage = image;
        this.helperService.orgImage.name = fileObj.metadata.name;
        this.helperService.orgImagePreview = fileObj.link;
        this.helperService.updateImg = true;
        this.upload();
      } else if (this.uploadType === "multiple") {
        // For components with multiple files upload
        // if (!this.showButton) {
        //   this.showButton = true;
        //   // document.getElementById("dbx-upload").hidden = false;
        // }
        if (!this.selectedImageIds.includes(file.id)) {
          this.selectedImages.push(file);
          this.selectedImageIds.push(file.id);
        } else {
          this.selectedImages.splice(
            this.selectedImages.findIndex((img) => img.id === file.id),
            1
          );
          this.selectedImageIds.splice(
            this.selectedImageIds.indexOf(file.id),
            1
          );
          // if (!this.selectedImageIds.length) {
          //   this.showButton = false;
          //   // document.getElementById("dbx-upload").hidden = true;
          // }
        }
      } else {
        // For components with single file upload
        // tslint:disable-next-line: max-line-length
        const fileObj = await this.parentService.dbxGetParticularFile(
          this.parentService.currentDbxUserToken.access_token,
          file.path_display
        );
        const image = await this.downloadDbxFile(fileObj);
        if (this.caller === "profile") {
          this.parentService.profileImage.next(image);
        } else if (this.caller === "business") {
          this.parentService.businessAvatar.next(image);
        } else if (this.caller === "banners") {
          this.parentService.banners.next(image);
        }
      }
    }
  }

  async goToPreviousDirectoryDbx() {
    const tokenObj = { token: this.parentService.currentDbxUserToken };
    this.getDbxFiles(tokenObj, this.previousDirectory);
    // To update the track of directories
    this.currentDirectory = this.previousDirectory;
    if (this.currentDirectory) {
      this.previousDirectory = this.directories.find(
        (el) => el.directory === this.currentDirectory
      ).previousDirectory;
    } else {
      this.previousDirectory = this.currentDirectory;
    }
  }

  downloadDbxFile(file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", file.link);
      xhr.responseType = "blob";
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.send();
    });
  }
  //// Dropbox End ////

  //// OneDrive Start ////
  async getOneDriveFiles(cred, path = "") {
    this.showPreview = false;
    this.openDriveAccountType = "";
    this.driveType = "oneDrive";
    this.currentFiles = [];
    if (this.previousDirectory === "root") {
      this.previousDirectory = "";
      this.currentDirectory = "";
    }
    // To reset selected Images
    this.selectedImages = [];
    this.selectedImageIds = [];
    this.parentService.currentOdUserToken = cred;
    // To check if the token has expired
    if (moment(cred.token.expiresOn).isBefore(moment())) {
      // To refresh the token in case of its expiration
      const updatedToken = await this.odRefreshExpiredToken(cred);
      this.getOneDriveFiles(updatedToken);
    } else {
      this.currentFiles = await this.parentService.oneDriveFiles(
        cred.token.accessToken,
        path
      );
    }
  }

  odRefreshExpiredToken(cred) {
    return new Promise((resolve, reject) => {
      this.authService
        .acquireTokenSilent({
          scopes: ["offline_access", "files.readwrite.all"],
        })
        .then((token) => {
          cred.token = token;
          cred.tokenId = cred._id;
          this.parentService.updateCredential(cred);
          resolve(cred);
        });
    });
  }

  async openOdFolderOrFile(file) {
    if (file.folder) {
      this.getOneDriveFiles(this.parentService.currentOdUserToken, file.id);
      this.previousDirectory = this.currentDirectory;
      this.currentDirectory = file.id;
      if (!this.directories.find((el) => el.directory === file.id)) {
        this.directories.push({
          directory: file.id,
          previousDirectory: this.previousDirectory,
        });
      }
    } else {
      if (this.caller === "addOrg") {
        const image = await this.getParticularFile(
          this.parentService.currentOdUserToken.token.accessToken,
          file.id
        );
        this.helperService.orgImage = image;
        this.helperService.orgImage.name = file.name;
        this.helperService.updateImg = true;
        this.upload();
      } else if (this.uploadType === "multiple") {
        // For components with multiple files upload
        // if (!this.showButton) {
        //   this.showButton = true;
        //   document.getElementById("oneDrive-upload").hidden = false;
        // }
        if (!this.selectedImageIds.includes(file.id)) {
          this.selectedImages.push(file);
          this.selectedImageIds.push(file.id);
        } else {
          this.selectedImages.splice(
            this.selectedImages.findIndex((img) => img.id === file.id),
            1
          );
          this.selectedImageIds.splice(
            this.selectedImageIds.indexOf(file.id),
            1
          );
          // if (!this.selectedImageIds.length) {
          //   this.showButton = false;
          //   document.getElementById("oneDrive-upload").hidden = true;
          // }
        }
      } else {
        // For components with single file upload
        // tslint:disable-next-line: max-line-length
        const image = await this.getParticularFile(
          this.parentService.currentOdUserToken.token.accessToken,
          file.id
        );
        if (this.caller === "profile") {
          this.parentService.profileImage.next(image);
        } else if (this.caller === "business") {
          this.parentService.businessAvatar.next(image);
        } else if (this.caller === "banners") {
          this.parentService.banners.next(image);
        }
      }
    }
  }

  async goToPreviousDirectoryOd() {
    this.getOneDriveFiles(
      this.parentService.currentOdUserToken,
      this.previousDirectory
    );
    // To update the track of directories
    this.currentDirectory = this.previousDirectory;
    if (this.currentDirectory) {
      this.previousDirectory = this.directories.find(
        (el) => el.directory === this.currentDirectory
      ).previousDirectory;
    } else {
      this.previousDirectory = this.currentDirectory;
    }
  }

  getParticularFile(accessToken, id) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        `https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`,
        true
      );
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.responseType = "blob";
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          if (this.caller === "addOrg") {
            this.helperService.orgImagePreview = e.target.result;
          }
          resolve(xhr.response);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.send();
    });
  }
  //// OneDrive End ////
}
