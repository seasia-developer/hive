import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { AdminService } from "../admin.service";
import { JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { HomeService } from "../../home.service";
@Component({
  selector: "app-predefined-workspaces",
  templateUrl: "./predefined-workspaces.component.html",
  styleUrls: ["./predefined-workspaces.component.scss"],
})
export class PredefinedWorkspacesComponent implements OnInit {
  categoryList: any;
  workspaceList: any;
  editCategoryIds = [];
  categoryForm: FormGroup;
  editCategoryForm: FormGroup;
  workspaces: any;
  submitted = false;
  activeCategory = "";
  constructor(
    public helperService: HelperService,
    public homeService: HomeService,
    private adminService: AdminService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getCategoriesList();
    this.getAdminWorkspaceList();
    this.categoryForm = this.fb.group({
      title: ["", [Validators.required]],
    });
    this.editCategoryForm = this.fb.group({
      title: ["", [Validators.required]],
    });
  }

  getCategoriesList() {
    this.adminService
      .getCategoryList()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.categoryList = jresponse.body;
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  getAdminWorkspaceList() {
    this.adminService
      .getAdminWorkspaces()
      .then((jresponse: JReponse) => {
        if (jresponse) {
          this.workspaceList = jresponse.body;
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }

  get form() {
    return this.categoryForm.controls;
  }

  addCategory() {
    const data = { Title: this.form.title.value };
    this.submitted = true;
    if (this.categoryForm.valid) {
      this.adminService
        .addCategory(data)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.categoryForm.reset();
            this.helperService.showSuccessToast(jresponse.message);
            this.getCategoriesList();
          }
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
      this.submitted = false;
    }
  }

  updateCategory(categoryId) {
    const data = {
      Title: this.editCategoryForm.controls.title.value,
      categoryId,
    };
    this.adminService
      .updateCategory(data)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helperService.showSuccessToast(jresponse.message);
          this.getCategoriesList();
          this.editCategoryIds.splice(
            this.editCategoryIds.indexOf(categoryId),
            1
          );
        }
      })
      .catch((err: Error) => {
        this.helperService.showErrorToast(err.message);
        throw err;
      });
  }

  removeCategory(id) {
    this.adminService
      .removeCategory(id)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          this.helperService.showSuccessToast(jresponse.message);
          this.getCategoriesList();
        }
      })
      .catch((err: Error) => {
        this.helperService.showErrorToast(err.message);
        throw err;
      });
  }

  getCategoryWorkspaces(categoryId) {
    this.activeCategory = categoryId;
    this.adminService
      .getCategoryWorkspaces(categoryId)
      .then((jresponse: JReponse) => {
        if (jresponse.success) {
          if (jresponse.body.length > 0) {
            const workspaces = jresponse.body[0].workspaces;
            this.adminService
              .getAdminWorkspaces()
              .then((response: JReponse) => {
                if (response) {
                  const adminWorkspaces = response.body;
                  const final = adminWorkspaces.map((value) => {
                    const result = workspaces.filter(
                      (adminArray) => adminArray._id == value._id
                    );
                    if (result.length > 0) {
                      value.name = result[0].name;
                      value.check = true;
                    }
                    return value;
                  });
                  this.workspaceList = final;
                }
              })
              .catch((err: any) => {
                throw err;
              });
          } else {
            this.getAdminWorkspaceList();
          }
        }
      })
      .catch((err: Error) => {
        this.helperService.showErrorToast(err.message);
        throw err;
      });
  }

  updateOptions(obj, event) {
    const arr = [obj];
    const requestData = this.workspaceList.map((value) => {
      const result = arr.filter((a1) => a1._id == value._id);
      if (result.length > 0) {
        value.name = result[0].name;
        value.check = event.target.checked;
      }
      return value;
    });
    this.workspaceList = requestData;
  }

  submitForm() {
    const totalChecked = document.querySelectorAll(
      "input[name=workspaces]:checked"
    ).length;
    if (totalChecked > 0 && this.activeCategory) {
      const result = [];
      this.workspaceList.forEach((obj) => {
        if (obj.check === true) {
          result.push(obj._id);
        }
      });
      const data = { categoryId: this.activeCategory, workspaces: result };
      this.adminService
        .assignWorkspaces(data)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            this.getCategoriesList();
          }
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
    } else {
      this.helperService.showErrorToast("Please select group");
    }
  }
}
