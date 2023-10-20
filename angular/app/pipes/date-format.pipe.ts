import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
  name: "dateFormat",
  pure: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      if (seconds < 29) {
        // less than 30 seconds ago will show as 'Just now'
        return "Just now";
      }
      const intervals = {
        y: 31536000,
        mth: 2592000,
        w: 604800,
        days: 86400,
        hrs: 3600,
        mins: 60,
        secs: 1,
      };
      let counter;
      for (let i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0) {
          if (counter === 1) {
            if (i === "mins") {
              i = "min";
            } else if (i === "hrs") {
              i = "hr";
            } else if (i === "days") {
              i = "day";
            }
            return counter + " " + i; // singular (1 day ago)
          } else {
            return counter + " " + i; // plural (2 days ago)
          }
        }
      }
    }
    return value;
  }
}
