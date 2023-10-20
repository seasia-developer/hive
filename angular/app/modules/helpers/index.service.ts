import {
  Injectable
} from "@angular/core";
import {
  HomeService
} from "../application/home/home.service";

@Injectable({
  providedIn: "root",
})

export class HelperFunctions {

  constructor(
    public homeService: HomeService
  ) {}

  // CHECK FILE - IMAGE / DOC 
  // TO RENDER FILE VIEW COMPONENT 
  checkTypeAndGetImageDoc(getImagePath: any) {
    // SPLIT URL & EXTENSION -> 'DOC'
    const path = getImagePath.split(',');
    // IF URL CONTAINS WITH EXTENSION 'DOC'
    return (path.length && path.length > 1 ? true : false)
  }

  // GET ATTACHMENT URL 
  // IF URL CONTAINS 'DOC' PARAM 
  getAttachmentcUrl(getImagePath: any, action: any = 'view') {
    // SPLIT URL & EXTENSION -> 'DOC'
    const fileUrl = getImagePath.split(',');

    if (action === 'download') {
      return this.getDownloadAttachment(fileUrl[0])
    }
    // APPLY SRC PATH
    return (fileUrl.length && fileUrl.length > 1 ? fileUrl[0] : false)
  }

  // DOWNALOD API FOR ATTACHMENT - IN MODAL BOX 
  async getDownloadAttachment(filename: any) {
    if (filename) {
      const fileUrl = filename.split('com/').splice(1)[0];
      // var link = document.createElement('a');
      // link.href = 'https://voxxi-assets-stage.s3.amazonaws.com/61a83d23bd8e010019d4e011/nexasindia/7a37d1f0-5f25-11ec-a864-1de59e6a29fd/landscape-cover.jpg';
      // link.download = 'Download.jpg';
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);


      if (fileUrl) {
        this.homeService
          .gets3Attachment({
            fileName: fileUrl,
          })
          .then((jresponse) => {

            // let dataType = jresponse.type;
            // let binaryData = [];
            // binaryData.push(jresponse);
            // let downloadLink = document.createElement('a');
            // downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            // if (filename)
            //     downloadLink.setAttribute('download', filename);
            // document.body.appendChild(downloadLink);
            // downloadLink.click();

          })
          .catch((err: Error) => {
            throw err;
          });
      }
    }
  }

  // GET FILE ICON USING EXTENSION 
  getFileIconUsingExtension(extension: any) {
    switch (extension) {
      case '.ods':
        return ("../../../../../../assets/images/file-types/Ods.svg");
        break;
      case '.odt':
        return ("../../../../../../assets/images/file-types/Odt.svg");
        break;
      case '.ppt':
      case 'application/mspowerpoint':
      case 'application/powerpoint':
      case 'application/vnd.ms-powerpoint':
        return ("../../../../../../assets/images/file-types/ppt.svg");
        break;
      case '.pptx':
      case 'application/x-mspowerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return ("../../../../../../assets/images/file-types/Pptx.svg");
        break;
      case '.doc':
      case 'application/msword':
      case 'application/doc':
      case 'application/ms-doc':
      case 'application/msword':
        return ("../../../../../../assets/images/file-types/Doc.svg");
        break;
      case '.docx':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return ("../../../../../../assets/images/file-types/Docx.svg");
        break;
      case '.xls':
      case 'application/excel':
      case 'application/vnd.ms-excel':
        return ("../../../../../../assets/images/file-types/Xls.svg");
        break;
      case '.xlsx':
      case 'application/x-excel':
      case 'application/x-msexcel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return ("../../../../../../assets/images/file-types/Xlsx.svg");
        break;
      case '.mov':
        return ("../../../../../../assets/images/file-types/Mov.svg");
        break;
      case '.mp3':
        return ("../../../../../../assets/images/file-types/Mp3.svg");
        break;
      case '.mp4':
        return ("../../../../../../assets/images/file-types/Mp4.svg");
        break;
      case '.avi':
      case 'video/avi':
        return ("../../../../../../assets/images/file-types/avi.svg");
        break;
      case '.csv':
        return ("../../../../../../assets/images/file-types/Csv.svg");
        break;
      case '.wmv':
        return ("../../../../../../assets/images/file-types/Wmv.svg");
        break;
      case '.text':
        return ("../../../../../../assets/images/file-types/Txt.svg");
        break;
      case '.pdf':
        return ("../../../../../../assets/images/file-types/pdf.svg");
        break;
      default:
        return ("../../../../../../assets/images/documents.svg");
        break;
    }
  }

  getSupportedFormat(fileExtension:any){
    const extensions = [".ods", ".odt", ".mov", ".avi", ".csv", ".wmv", ".zip", ".tar", ".gz", ".7z"];
    return extensions.includes(fileExtension) ? true : false;
  }

  closeModalBox(){
    document.querySelectorAll('[class^="carousel-item"]').forEach(el => el.classList.remove("active"));
  }
  
}
