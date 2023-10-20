import { Component, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { SocketService } from 'src/app/services/socketio.service';
import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  userData: any;
  mediaUrl = environment.MEDIA_URL;
  textAreaHeight = 0;
  canAddComment: any = true;
  constructor(
    public helperService: HelperService,
    public socketService: SocketService
  ) { }

  ngOnInit() {
    this.userData = this.helperService.getLocalStore("userData");
  }

  setTextAreaLength(id) {
    const label = id + '-textArea';
    if (document.getElementById(label)) {
      const textElement = document.getElementById(label);
      const windowElement = document.getElementById(id + "-chatWindow");
      let heightDiff = 0;
      if (textElement.scrollHeight > this.textAreaHeight) {
        if (this.textAreaHeight) {
          heightDiff = textElement.scrollHeight - this.textAreaHeight;
        }
        this.textAreaHeight = textElement.scrollHeight;
      }
      textElement.style.height = "1px";
      const height = 2 + textElement.scrollHeight + "px";
      if (heightDiff) {
        windowElement.style.height = (windowElement.offsetHeight - heightDiff) + "px";
      }
      textElement.style.setProperty("height", height, "important");
    }
  }
  
  scrollUp(event, user) {
    if (event.target.scrollTop == 0) {
      this.socketService.getMessages({
        recipient: user.id,
        skip: this.helperService.messages[user.id]
          .length,
      });
    } 
  }

  sendMessage(message, event, recipient) {
    const charCode = event.which ? event.which : event.keyCode;
    let comment = event.target.innerText.trim();
    // if (charCode == 13 && event.shiftKey) {
    //   this.canAddComment = true;
    //   event.stopPropagation();
    // } else 
    if (charCode == 13 && comment.trim().length && this.canAddComment) {
      event.preventDefault();
      this.canAddComment = false;
      //   if (charCode == 13 && event.target.value.trim().length) {
      const data = {
        recipient: recipient,
        message: comment,
      };
      this.socketService.sendMessage(data);
      setTimeout(() => {
        const el: any = document.getElementsByClassName(recipient.toString() + "-textArea");
        for (let i = 0; i < el.length; i++) {
          el[i].value = "";
          el[i].innerText = "";
        }
        this.canAddComment = true;
      }, 50);
    }
  }

  getMessages(user, type = 'desktop') {
    const isChatOpen = this.helperService.openedChat.find(u => u.id === user.id);
    if (!isChatOpen) {
      if (this.helperService.openedChat.length === 2) {
        this.helperService.openedChat.pop();
        this.helperService.showChat.shift();
      }
      this.helperService.selectedRecipient = user.id;
      this.helperService.openedChat.unshift(user);
      this.helperService.showChat.push(user.id);
      this.socketService.getMessages({ recipient: user.id, skip: this.helperService.messages[user.id] ? this.helperService.messages[user.id].length : 0 });
    }
    if (type === 'mobile' && (!this.helperService.openedMobileChat.id || (this.helperService.openedMobileChat && this.helperService.openedMobileChat.id !== user.id))) {
      this.helperService.openedMobileChat = user;
      this.socketService.getMessages({ recipient: user.id, skip: this.helperService.messages[user.id] ? this.helperService.messages[user.id].length : 0 });
    }
    if (this.helperService.openedChat.length === 1) {
      document.getElementById("mainBody").classList.add("chat-open");
    }
  }

  toggleChatWindow(event, id, type = 'desktop') {
    if (event.target.id !== "chatWindowCloseButon") {
      if (type === 'mobile') {
        this.helperService.showMobileChat = !this.helperService.showMobileChat;
        if (this.helperService.showMobileChat) {
          const el = document.getElementById('mobileChatWindow');
          setTimeout(() => {
            el.scrollTop = el.scrollHeight;
          }, 0);
        }
      } else {
        if (this.helperService.showChat.includes(id)) {
          this.helperService.showChat.splice(this.helperService.showChat.indexOf(id), 1);
        } else {
          this.helperService.showChat.push(id);
          const el = document.getElementById(`${id}-chatWindow`);
          setTimeout(() => {
            el.scrollTop = el.scrollHeight;
          }, 0);
        }
      }
    } else {
      this.helperService.openedMobileChat = {};
      this.helperService.messages[id]=[];
      this.helperService.openedChat.splice(this.helperService.openedChat.findIndex(user => user.id === id), 1);
      this.helperService.showChat.splice(this.helperService.showChat.indexOf(id), 1);
      if (!this.helperService.openedChat.length) {
        document.getElementById("mainBody").classList.remove("chat-open");
      }
    }
  }
}
