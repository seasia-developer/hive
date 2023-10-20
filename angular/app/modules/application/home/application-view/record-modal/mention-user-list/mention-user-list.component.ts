

import { Component, Input, ViewChild } from '@angular/core'
import 'quill-mention'

import { QuillEditorComponent } from 'ngx-quill'
import { AppViewService } from "../../application-view.service";
import * as _ from "lodash";
import { Subscription } from "rxjs";
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-mention-user-list',
  templateUrl: './mention-user-list.component.html'
})
export class MentionUserListComponent {
  @ViewChild(QuillEditorComponent, { static: true }) editor: QuillEditorComponent
  @Input() content = '';
  matContent = '';
  selectedMentionUsers = [];
  mentionUsersList: any;
  canAddComment = true;
  refreshCommentSubscription = new Subscription();
  isMentionUserSelect = true;
  constructor(
    public appViewService: AppViewService,
  ) { }

 

  ngOnInit() {
    this.refreshCommentSubscription = this.appViewService
      .getRecordMentionFlag()
      .subscribe(async (flag) => {
        this.isMentionUserSelect = true;
        this.canAddComment = true;

        if (flag.selectedMentionUsers) {
          this.selectedMentionUsers = flag.selectedMentionUsers
        }
        this.content = flag.comment;
      });
  }
  open() {
    const selection = this.editor.quillEditor.getSelection(true);
    this.editor.quillEditor.focus();
    this.editor.quillEditor.insertText(selection.index, '@');
    this.editor.quillEditor.blur();
    this.editor.quillEditor.focus();
  }
  addComment(event) {
    let commentText = event.target.innerText;
   
    this.selectedMentionUsers.forEach((element) => {
      commentText = commentText.replace(element.name, element.id);
    });
    commentText = commentText.trim();
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 40 && this.isMentionUserSelect == false) {
      this.isMentionUserSelect = true;
    }
    if (charCode == 13 && event.shiftKey) {
      this.canAddComment = true;
      event.stopPropagation();
    } else if (charCode == 13 && commentText.length && this.canAddComment && this.isMentionUserSelect) {
      event.preventDefault();
      this.canAddComment = false;
     this.appViewService.sendRecordCommentData(commentText);
    }
  }
  modules = {
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      showDenotationChar: false,
      onSelect: (item, insertItem) => {
        this.isMentionUserSelect = false;
        const data = {
          id: `{{${item.id}}}`,
          name: item.target
        };

        this.selectedMentionUsers.push(data);
        const editor = this.editor.quillEditor
        insertItem(item)
        // necessary because quill-mention triggers changes as 'api' instead of 'user'
        editor.insertText(editor.getLength() - 1, '', 'user')
      },
      onClose: (item, insertItem) => {
        setTimeout(() => {
          this.isMentionUserSelect = true;
        }, 250);
      },
      source: (searchTerm, renderList) => {
        this.mentionUsersList = [];
        this.mentionUsersList = this.appViewService.members;
        this.mentionUsersList = this.mentionUsersList.filter(
          (element) => {
            return element !== null;
          }
        );
        if (this.mentionUsersList.length) {
          this.mentionUsersList = this.mentionUsersList.map((e) => {

            let avatar = "../../../../../assets/images/user.png";
            if (e.avatar) {
              avatar = `${environment.MEDIA_URL}/${e.avatar}`;
            }
            return {
              id: e._id.toString(),
              target:(e.lastName && !_.isEmpty(e.lastName)) ?  e.firstName + ' ' + e.lastName :e.lastName,
              value: (e.lastName && !_.isEmpty(e.lastName)) ? '<img src="' + avatar + '" style="width: 22px;height: 22px;border-radius: 100%!important;margin-right: 10px!important;">' + e.firstName + ' ' + e.lastName :
                '<img src="' + avatar + '" style="width: 16px!important;height: 16px!important;border-radius: 100%!important;margin-right: 5px!important;position: absolute!important; top: -1px; left: -22px;">' + e.firstName

            };
          });

        }


        if (searchTerm.length === 0) {
          renderList(this.mentionUsersList, searchTerm)
        } else {
          const matches = [];
          this.mentionUsersList.forEach((entry) => {
            if (entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
              matches.push(entry)
            }
          });
          renderList(matches, searchTerm);
        }
      }
    },
    toolbar: false
  }

}
