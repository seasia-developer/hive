import { Injectable, ElementRef, ViewChild } from "@angular/core";
import * as io from "socket.io-client";
import { HelperService } from "./helper.service";
import { environment } from "src/environments/environment";
import * as _ from "lodash";

@Injectable()
export class SocketService {

  socket;
  onlineUsers = [];
  //   badge = false;
  //   ticketResolved = new Subject<any>();

  constructor(private helperService: HelperService) { }

  connectSocket() {
    const token = this.helperService.loggedUser.token;
    const socketUrl = `${environment.SOCKET_URL}?authorization=${token}`;
    this.socket = io(socketUrl);
    this.socket.on("connect", () => {
    });

    // To get online status of the followers/followings at the time of login
    this.socket.on("getStatuses", (data) => {
    
      let userData = this.helperService.getLocalStore("userData");
      data = _.reject(data, {
        id: userData.owner
      });
      this.helperService.followers = data;
      this.onlineUsers = [];

      data.forEach(user => {

        if (user.isOnline) {
          this.onlineUsers.push(user);
        }
      });
    });

    // To update the status if someone comes online or goes offline
    this.socket.on("onOnlineStatusUpdate", (data) => {
      const user = this.helperService.followers.find(
        (user) => user.id == data.userId
      );
      if (user) {
        user.isOnline = data.isOnline;
        if (data.isOnline) {
          if (!this.onlineUsers.find(user => user.id === data.userId)) {
            this.onlineUsers.push(user);
          }
        } else {
          const ind = this.onlineUsers.findIndex(u => u.id === data.userId);
          if (ind >= 0) {
            this.onlineUsers.splice(ind, 1);
          }
        }
      }

    });

    // To load messages when a chat window is opened
    this.socket.on("loadMessages", (data) => {
    
      const messages = data.messages.reverse();
      const el = document.getElementById(`${data.recipient}-chatWindow`);
      const mobileElement = document.getElementById('mobileChatWindow');
      const oldScrollHeight = el.scrollHeight;
      let oldScrollMobileHeight = 0;
      if (mobileElement) {
        oldScrollMobileHeight = mobileElement.scrollHeight;
      }

      let firstTime = false;
      if (!this.helperService.messages[data.recipient]) {
        this.helperService.messages[data.recipient] = [];
        firstTime = true;
      }
      this.helperService.messages[data.recipient] = [
        ...messages,
        ...this.helperService.messages[data.recipient],
      ];
      if (firstTime) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 0);
        if (mobileElement) {
          setTimeout(() => {
            mobileElement.scrollTop = mobileElement.scrollHeight;
          }, 0);
        }
      } else {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight - oldScrollHeight;
        }, 0);
        if (mobileElement) {
          setTimeout(() => {
            mobileElement.scrollTop = mobileElement.scrollHeight - oldScrollMobileHeight;
          }, 0);
        }
      }
    });

    // To add recently sent or received message in the messages array
    this.socket.on("newMessage", (data) => {
      const id =
        data.sender == this.helperService.loggedUser.owner
          ? data.recipient
          : data.sender;
      const el = document.getElementById(`${id}-chatWindow`);
      this.helperService.messages[id].push(data);
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 0);
      const mobileElement = document.getElementById('mobileChatWindow');
      if (mobileElement) {
        setTimeout(() => {
          mobileElement.scrollTop = mobileElement.scrollHeight;
        }, 0);
      }
    });

    // this.socket.emit('my message', 'Hello there from Angular.');

    // this.socket.on('my broadcast', (data: string) => {
    // });
    // this.todoService.eventEnum.forEach(element => {
    //   this.socket.on(element, (data) => {
    //     this.onSocketEvent(data);
    //   });
    // });

    this.socket.on("onNewMessage", (data) => {
      const el = document.getElementById(`${data.sender}-chatWindow`);
      const mobileElement = document.getElementById('mobileChatWindow');
      let hasMessagesLoaded = false;
      if (this.helperService.messages[data.sender]) {
         if (this.helperService.messages[data.sender] && this.helperService.messages[data.sender].length) {
          this.helperService.messages[data.sender].push(data);
        } else {
         
          this.getMessages({ recipient: data.sender, skip: 0 });
        }
        // this.helperService.messages[data.sender].push(data);
        hasMessagesLoaded = true;
      }
      if (this.helperService.messages[data.recipient]) {
        if (!this.helperService.messages[data.recipient]) {
          this.getMessages({ recipient: data.recipient, skip: 0 });
        } else {
          this.helperService.messages[data.recipient].push(data);
        }
        // this.helperService.messages[data.recipient].push(data);
        // hasMessagesLoaded = true;
      }
      const user = this.helperService.followers.find(u => u.id === data.sender);
      const isChatOpen = this.helperService.openedChat.find(u => u.id === user.id);
      if (!isChatOpen) {
        this.helperService.selectedRecipient = user.id;
        this.helperService.openedChat.unshift(user);
        // this.helperService.showChat.push(user.id);
        if (!hasMessagesLoaded) {
          this.getMessages({ recipient: user.id, skip: 0 });
        }
      }
      if (el) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 0);
      }
      if (mobileElement) {
        setTimeout(() => {
          mobileElement.scrollTop = mobileElement.scrollHeight;
        }, 0);
      }
    });

    this.socket.on("updateNotificationCount", (data) => {
      if (data.message) {
        this.helperService.notificationCount += 1;
        this.helperService.setLocalStore(
          "notificationCount",
          this.helperService.notificationCount
        );
      }
    });

    this.socket.on("getOnlineStatus", (data) => {
      this.helperService.userActiveStatuses = data;
    });

    this.socket.on("disconnect", () => {
    });
  }

  //   onSocketEvent(data) {
  //     if (data.actionType === 'ticketResolved') {
  //       this.ticketResolved.next(data);
  //     }
  //     if (data.count) {
  //       this.notificationService.countUpdated.next(data.count);
  //     }
  //     if (data.msg) {
  //       this.notificationService.showSuccess(data.msg);
  //       this.badge = true;
  //     }
  //   }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sendMessage(data) {
    this.socket.emit("emitNewMessage", data);
  }

  getMessages(data) {
    this.socket.emit("getMessages", data);
  }

  getOnlineStatuses(data) {
    this.socket.emit("checkStatus", { users: data })
  }
}
