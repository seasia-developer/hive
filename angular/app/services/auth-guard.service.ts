import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from "@angular/router";
import { HelperService } from "./helper.service";

@Injectable({
  providedIn: "root",
})

export class AuthGuard implements CanActivate {
  constructor(private router: Router, private helper: HelperService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): boolean {
    const user = this.helper.loggedUser;
    if (user && user.token) {
      if (user.onboarding || user.role === "guest") {
        if (
          routerStateSnapshot.url.includes("/onboarding") ||
          routerStateSnapshot.url.includes("/auth")
        ) {
          this.router.navigate(["application/home"]);
          return false;
        } else {
          return true;
        }
      } else {
        if (routerStateSnapshot.url.includes("/onboarding")) {
          return true;
        }
        this.router.navigate(["onboarding"]);
        return false;
      }
    } else if (routerStateSnapshot.url.includes("/auth")) {
      return true;
    } else {
      if (routerStateSnapshot.url.includes("/invite/paid-groups")) {
        localStorage.setItem("redirect", routerStateSnapshot.url);
        this.router.navigate(["auth/sign-in"]);
      } else {
        this.router.navigate(["auth/sign-in"]);
      }

      return false;
    }
  }
}
