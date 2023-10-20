import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  /**
   * usernameAsEmailValidator(control) = check user name as email valid or not (left & right space except)
   * @param control in form control
   */
  static usernameAsEmailValidator(control) {
    // RFC 2822 compliant regex // [a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?
    // if (control.value.match(/^\s*[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\s*$/g)) {
    if (control.value.match(/\s*(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)\s*$)/g)) {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
    }
  }

  /**
   * emailValidator(control) => check email valid or not (left & right space not except)
   * @param control in form control
   */
  static emailValidator(control) {
    // RFC 2822 compliant regex // [a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?
    // ^\s*[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\s*$
    if (control.value.match(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/g)) {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
    }
  }

  /**
   * mobileNumberValidator(control) => check mobile number valid or not
   * @param control in form control
   */
  static mobileNumberValidator(control) {
    // Valid mobile number entry.
    // {+1 8087339090}, {+91 8087339090}, {+912 8087339090}, {8087339090}, {0808733909}, {+1-8087339090}, {+91-8087339090}, {+912-8087339090}, {+918087677876}, {+9108087735454}

    // ^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?([6789]{1})([23456789]{1})([0-9]{8})?([0-9]{3})$ ==> +91987654321
    // ^([6789]{1})([23456789]{1})([0-9]{8})$ ==> 10 digit mobile number
    // ^([6789]{1})([23456789]{1})([0-9]{8,13})$ ==> between 10 to 15 digit mobile number
    if (control.value.match(/^([1-9]{1})([0-9]{9})$/)) {
      return null;
    } else {
      return { 'invalidMobileNumber': true };
    }
  }

  /**
   * webUrlValidator(control) => check website url valid or not
   * @param control in form control
   */
  static webUrlValidator(control) {
    if (control.value.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/)) {
      return null;
    } else {
      return { 'invalidWebUrl': true };
    }
  }

  /**
   * matchingPasswords(passwordKey, confirmPasswordKey) => check password or confirm password both are same or not 
   * @param passwordKey in password value
   * @param confirmPasswordKey in confirm password value
   */
  static matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    // TODO maybe use this https://github.com/yuyang041060120/ng2-validation#notequalto-1
    return (group: FormGroup): { [key: string]: any } => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  checkAlphaValidation(event: any) {
    const pattern = /^[a-zA-Z ]*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {    
        event.preventDefault();
    }
  };

  checkAlphaNumericValidation(event: any) {
    const pattern = /^[a-zA-Z0-9 ]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    
    if (!pattern.test(inputChar)) {    
        event.preventDefault();
    }
  };

  onlyNumber(event: any) {
    const pattern = /^([0-9]{1,2})*$/;
    const inputChar = String.fromCharCode(event.charCode);

    if(!pattern.test(inputChar)){
      event.preventDefault();
    }
  }
}
