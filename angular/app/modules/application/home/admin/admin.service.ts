import { Injectable } from "@angular/core";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

import { APIService } from "../../../../services/api.service";

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";
@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(private apiservice: APIService) {}

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  addRestrictedDomain(data) {
    return this.apiservice.postWithHeader(`/admin/restrictedDomains`, data);
  }

  removeRestrictedDomain(domainId) {
    return this.apiservice.deleteWithHeader(
      `/admin/restrictedDomains/${domainId}`
    );
  }

  getRestrictedDomains() {
    return this.apiservice.getWithHeader(`/admin/restrictedDomains`);
  }

  getAllRestrictedDomains() {
    return this.apiservice.get(`/admin/restrictedDomains`);
  }

  getCategoryList() {
    return this.apiservice.getWithHeader(`user/categoryList`);
  }

  addCategory(data) {
    return this.apiservice.postWithHeader(`/category/addCategory`, data);
  }

  updateCategory(data) {
    return this.apiservice.postWithHeader(`/category/editCategory`, data);
  }

  removeCategory(categoryId) {
    return this.apiservice.deleteWithHeader(`/category/${categoryId}`);
  }

  assignWorkspaces(data) {
    return this.apiservice.postWithHeader(`/category/assign-workspaces`, data);
  }

  getAdminWorkspaces() {
    return this.apiservice.getWithHeader(`category/admin-workspaces`);
  }

  getCategoryWorkspaces(categoryId) {
    return this.apiservice.getWithHeader(
      `category/${categoryId}/categoty-workspaces`
    );
  }

  getIndustries() {
    return this.apiservice.getWithHeader(`/user/industryList`);
  }

  addIndustry(data) {
    return this.apiservice.postWithHeader(`/user/addIndustry`, data);
  }

  updateIndustry(data) {
    return this.apiservice.postWithHeader(`/user/editIndustry`, data);
  }

  removeIndustry(industryId) {
    return this.apiservice.deleteWithHeader(`/user/industry/${industryId}`);
  }

  getCoupons() {
    return this.apiservice.getWithHeader("/user/getCoupons");
  }

  getCouponDetail(id) {
    return this.apiservice.getWithHeader(`/user/${id}/getCouponInfo`);
  }

  generateCoupon(data) {
    return this.apiservice.postWithHeader(`/user/addCoupon`, data);
  }

  editCoupon(id, data) {
    return this.apiservice.postWithHeader(`/user/${id}/editCoupon`, data);
  }

  sendCouponEmail(couponId) {
    return this.apiservice.getWithHeader(`/user/${couponId}/sendCouponMail`);
  }

  getUsers() {
    return this.apiservice.getWithHeader("/subscriptions/list");
  }

  getWorkspaces(query:any) {
    return this.apiservice.getWithHeader(`/organization/getAllWorkspaces?search=${query}`);
  }

  storePaidWorkspaces(data:any) {
    return this.apiservice.postWithHeader(`/organization/storePaidWorkspaces`,data);
  }

  getPlans() {
    return this.apiservice.getWithHeader("/subscriptions/plans/list");
  }

  getPlan(planId:any) {
    return this.apiservice.getWithHeader(`/subscriptions/plans/${planId}/list`);
  }

  getUser(id:any) {
    return this.apiservice.getWithHeader(`/subscriptions/list/user/${id}`);
  }

  deleteUser(id:any) {
    return this.apiservice.deleteWithHeader(`/subscriptions/list/user/${id}`);
  }

  deleteSubscription(userId:any) {
    return this.apiservice.deleteWithHeader(`/subscriptions/delete/${userId}`);
  }

  updateUserSubscription(data:any) {
    return this.apiservice.postWithHeader(`/subscriptions/list/user`,data);
  }

  getUserCoupons(email:any) {
    return this.apiservice.getWithHeader(`/subscriptions/coupons/${email}/list`);
  }

  applayCoupon(data) {
    return this.apiservice.postWithHeader(`/subscriptions/list/user/apply-coupon`, data);
  }

  
}
