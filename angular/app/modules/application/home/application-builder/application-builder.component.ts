import { Component, OnInit, Renderer2, HostListener } from "@angular/core";
import { FormBuilder, FormGroup, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CdkDragDrop, moveItemInArray, CdkDrag } from "@angular/cdk/drag-drop";
import { v4 as uuid } from "uuid";
import * as _ from "lodash";
import { convert } from "metric-parser";

import { Constants } from "../../../../constants/constants";
import { HelperService } from "src/app/services/helper.service";
import { AppBuilderService } from "./application-builder.service";
import { JReponse } from "src/app/services/api.service";
import { AppViewService } from "../application-view/application-view.service";
import { HomeService } from "../home.service";

import * as moment from "moment";
import { environment } from "src/environments/environment";
import { importExpr } from "@angular/compiler/src/output/output_ast";
@Component({
  selector: "app-application-builder",
  templateUrl: "./application-builder.component.html",
  styleUrls: ["./application-builder.component.scss"],
})
export class ApplicationBuilderComponent implements OnInit {
  builderOptions = Constants.APP_BUILDER_OPTIONS;
  categoryColors = Constants.CATEGORY_COLORS;
  selected = [];
  appList = [];
  wsList = [];
  displayApps = false;
  selectedApps = [];
  editAppFields = [];
  appBuilderForm: FormGroup;
  appId: string;
  // orgId: string;
  selectedHelpTextItem: number;
  selectedAppItem: number;
  // To toggle field's attribute menu
  openMenu;
  // To toggle category's color menu
  openCategoryColorMenu = "";
  // Fields that are valid for calculator formula
  calculationFields = [];
  displayCalculatorFields: boolean;
  fieldOperands = [];
  toHide;
  type = "add";
  formula;
  variablesCollection = [];
  showBtn = true;
  workspaceId: any;
  keyword = "";
  mentionConfig = { mentionSelect: this.onMentionSelect };
  isModalOpen: boolean;
  teamView;
  privateView;
  flagForContributed;
  showAddButton = false;
  optionDefault = false;

  onMentionSelect(selection) {
    selection.original = 1;
    return `${selection.label}`;
  }

  getCalculatorValue(event, item) {
    let formulaText = event.target.value;
    let fields = this.calculationFields;

    this.variablesCollection = _.filter(fields, function (source) {
      return formulaText.indexOf(source.label) > -1;
    });
    _.each(this.variablesCollection, function (variable) {
      let compileTemplate = _.template("<%= uniqueId %>");
      let label = variable.label.toString();
      while (formulaText.includes(label)) {
        formulaText = formulaText.replace(
          label,
          compileTemplate({ uniqueId: variable.uniqueId })
        );
      }
    });
    let collection = this.variablesCollection;
    let formulaData = _.map(
      this.expressionToArray(formulaText),
      function (value) {
        let newValue = value;
        let variable = _.find(collection, { uniqueId: parseInt(value) });

        if (variable) {
          let path = "";
          switch (variable.type) {
            case "number":
              path = "number";
              break;
            case "money":
              path = "money";
              break;
          }
          newValue = {
            field: variable.uniqueId,
            valuePath: path,
          };
        }
        return newValue;
      }
    );
    //let convertstr = formulaData.toString()
    let finalExpression = convert(formulaData);
    item.formula = finalExpression;
    if (finalExpression.code === 0) {
      this.showBtn = true;
      item.formulaData = finalExpression.data;
      item.rawFormula = formulaText;
      item.rawFormulaDisplay = event.target.value;
    } else {
      this.showBtn = false;
    }
  }
  expressionToArray(formula) {
    formula = formula.replace(/ /g, "");
    let expression = formula.replace(/[a-zA-Z0-9]+/g, "#");
    let expressionData = expression.split("");
    let variables = formula.split(/[^a-zA-Z0-9\.]+/).filter(function (n) {
      return !_.isEmpty(n);
    });
    let result = [];

    result = _.map(expressionData, function (value) {
      if (value === "#") {
        return variables.shift();
      }
      return value;
    });

    return result;
  }
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private helperService: HelperService,
    private appBuilderService: AppBuilderService,
    private router: Router,
    private renderer: Renderer2,
    private appViewService: AppViewService,
    private homeService: HomeService
  ) {
    this.appBuilderForm = this.fb.group({
      appArray: this.fb.array([]),
    });
  }

  ngOnInit() {
    if (window.innerWidth < 767) {
      this.showAddButton = true;
    } else {
      this.showAddButton = false;
    }
    // To close menus when clicked anywhere except for the menu
    this.renderer.listen("window", "click", (event) => {
      // tslint:disable-next-line: max-line-length
      if (
        event.target.localName !== "img" &&
        event.target.className !== "checkmark" &&
        event.target.className !== "check-container" &&
        event.target.type !== "checkbox" &&
        event.target.type !== "radio"
      ) {
        this.openMenu = "";
      }
      if (event.target.className !== "bg-box-inner") {
        this.openCategoryColorMenu = "";
      }
    });
    this.appId = this.activatedRoute.snapshot.queryParams.appId;
    this.workspaceId = this.activatedRoute.snapshot.queryParams.workspaceId;
    this.flagForContributed = this.activatedRoute.snapshot.queryParams.flagForContributed;
    // this.orgId = this.activatedRoute.snapshot.queryParams.orgId;
    // this.addItem(this.builderOptions[0]);
    this.getEditAppFields();
    this.getViews(this.appId);
  }

  get appArray() {
    return this.appBuilderForm.get("appArray") as FormArray;
  }

  //  To add items in the selected fields array (Right list)
  addItem(item) {
    item.uniqueId =
      item.formType && item.formType == "edit"
        ? item.uniqueId
        : Math.floor(Date.now());
    let field = JSON.parse(JSON.stringify(item));
    if (item.type === "date" && item.formType !== "edit") {
      const getDate = this.selected.find((appElement) => {
        return appElement.type === "date";
      });
      if (getDate === undefined) {
        field.options[2].value = true;
        field.options[4].options[0].checked = true;
        field.options[4].options[1].checked = false;
      }
    }
    if (item.type === "number" || item.type === "money") {
      this.calculationFields.push(field);
    }
    if (item.type === "relationship") {
      if (item.selectedApps && item.selectedApps.length > 0) {
        item.selectedApps.forEach((e) => {
          this.appBuilderService
            .getAppDetail(e._id)
            .then((jresponse: JReponse) => {
              let appDetail = jresponse.body[0];
              e._id = appDetail._id;
              e.name = appDetail.name;
              e.createdAt = appDetail.createdAt;
              e.organization_id.name = appDetail.organization_id.name;
              this.appBuilderService
                .getViewList(e._id)
                .then((jresponse: JReponse) => {
                  let teamView;
                  let privateView;
                  if (jresponse.body.length) {
                    jresponse.body.forEach((value) => {
                      if (value.type == "team") {
                        teamView = value.list;
                      } else {
                        privateView = value.list;
                      }
                    });
                  }
                  e.teamView = teamView;
                  e.privateView = privateView;
                })
                .catch((err: Error) => {
                  throw err;
                });
            })
            .catch((err: Error) => {
              throw err;
            });
        });
      }
      field.selectedApps =
        item.selectedApps && item.selectedApps.length > 0
          ? item.selectedApps
          : [];
    }
    if (item.type === "relationship" && !item.selectedApps) {
      field.selectedApps = [];
      this.selected.push(field);
      this.selectedRelationItem(this.selected.length - 1);
    } else {
      this.selected.push(field);
      this.appArray.push(this.fb.control(field.placeholder));
    }
  }

  //  To remove items from the selected fields array (Right list)
  removeItem(index, item) {
    if(index !== 0){
      const elements = document.getElementsByClassName(item.uniqueId.toString());
      while (elements.length > 0) elements[0].remove();
      let elms = document.querySelectorAll("p.calculation-error");
      if (elms && elms.length > 0) {
        this.showBtn = false;
      } else {
        this.showBtn = true;
      }
      if (item.type == "number" || item.type === "money") {
        this.calculationFields = _.reject(this.calculationFields, {
          label: item.label,
        });
      }
  
      // this.openMenu.splice(this.openMenu.indexOf(index), 1);
      this.openMenu = "";
      this.selected.splice(index, 1);
      this.appArray.removeAt(index);
    }
  }

  submitForm() {
    // To avoid updation of the builderOptions
    const result = [];
    this.selected.forEach((ob) => {
      result.push(Object.assign({}, ob));
    });
    let firstTime = true;
    // To modify the result accordingly
    result.forEach((el, ind) => {
      delete el.placeholder;
      el.index = ind;
      const options = {};
      el.options.forEach((op, i) => {
        if (op.type === "checkbox") {
          var opValue =  op.value;
          // opValue = this.helperService.removeTags(opValue);

          options[op.label] = opValue;

        } else if (op.type === "radio") {
          options[op.name] = op.options.find(
            (option) => option.checked === true
          ).label;
        } else {
          options[op.type] = op.value;
        }
      });
      el.options = options;
      if (el.type === "calculator") {
        el.options.formulaData = el.formulaData;
        el.options.rawFormula = el.rawFormula;
        el.options.rawFormulaDisplay = el.rawFormulaDisplay;
        delete el.rawFormula;
        delete el.formulaData;
        delete el.rawFormulaDisplay;
      }
      if (el.type === "relationship") {
        el.options.selectedApps = el.selectedApps;
        delete el.selectedApps;
      }
      // if change number and money label

      // For Category field
      if (el.type === "category") {
        if (firstTime) {
          if (!this.optionDefault) {
            el.options["Color in calendar"] = true;
          }
          firstTime = false;
        }
        el.options.selectOptions = el.selectOptions;
        delete el.selectOptions;
      }
    });
    const data = { application_id: this.appId, template: [] };
    data.template = result;
    if (data.template.length) {
      this.appBuilderService
        .createAppBuilder(data)
        .then((jresponse: JReponse) => {
          if (jresponse.success) {
            this.helperService.showSuccessToast(jresponse.message);
            // To reset grouping options
            this.appViewService.displayColumnOption = undefined;
            this.appViewService.displayRowOption = undefined;
            if (this.type === "add") {
              if (!this.flagForContributed && this.flagForContributed !== true) {
                this.router.navigate(
                  ["application/home/app-view/applicationView"],
                  {
                    queryParams: {
                      appId: jresponse.body.application_id,
                      workspaceId: jresponse.body.workspace_id,
                    },
                  }
                );
              } else {
                this.router.navigate(
                  ["application/home/admin/contributed-workspaces"],
                  {
                    queryParams: {
                      appId: jresponse.body.application_id,
                      workspaceId: jresponse.body.workspace_id,
                      flagForContributed: this.flagForContributed,
                    },
                  }
                );
              }
            } else {
              const app = this.appViewService.workspaceAppsList.find(
                (app) => app._id === this.appId
              );
              this.navigateToApplication(app);
            }
          }
        })
        .catch((err: Error) => {
          this.helperService.showErrorToast(err.message);
          throw err;
        });
    } else {
      this.helperService.showErrorToast("Please select a field");
    }
  }

  add(event) {

    // if(event.previousContainer.id === 'right-section-d' && event.container.id === 'right-section-d'){
    //   console.log('dqwdqwd')
    //  return false;
    // }
    // else{
      // LEFT SIDE ITEMS 
      if((event.previousContainer.id === 'left-section-d' && event.currentIndex !== 0)){
        this.addFieldsToAppBuilder(event)
      }
      // RIGHT SIDE ITEMS
      if(event.previousContainer.id === 'right-section-d'){
        if(event.previousContainer.id === 'right-section-d' && event.container.id === 'right-section-d'){
          console.log('event.currentIndex',event.currentIndex)
          if(event.currentIndex !== 0){
            if(event.previousIndex !== 0){
            this.addFieldsToAppBuilder(event)
            }
          }
        }
      }
    // }
  } 

  addFieldsToAppBuilder(event){
    if (event.previousContainer === event.container) {
      this.openMenu = String(event.currentIndex);
      moveItemInArray(this.selected, event.previousIndex, event.currentIndex);
      moveItemInArray(
        this.appArray.value,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const item = JSON.parse(
        JSON.stringify(this.builderOptions[event.previousIndex])
      );
      // this.selected.push(item);
      // this.appArray.push(this.fb.control(item.placeholder));
      // if (item.type === "number" || item.type === "money") {
      //   this.calculationFields.push(item);
      // }
      item.uniqueId =
      item.formType && item.formType == "edit"
        ? item.uniqueId
        : Math.floor(Date.now());
      this.selected.splice(event.currentIndex, 0, item);
      // transferArrayItem(event.previousContainer.data,
      //   event.container.data,
      //   event.previousIndex,
      //   event.currentIndex);
    }
  }

  // To change the order
  dropRightListItems(event: CdkDragDrop<string[]>) {
    // if (this.openMenu.includes(event.previousIndex)) {
    //   this.openMenu.splice(this.openMenu.indexOf(event.previousIndex), 1);
    //   this.openMenu.push(event.currentIndex);
    // }
  }

  // To show or hide particular field's option menu
  toggleMenu(index) {
    if (this.openMenu === index) {
      this.openMenu = "";
    } else {
      this.openMenu = index;
    }
  }

  // To update the value of options from the menu
  updateOptions(obj, event, selected: any = {}) {
    if (obj.label) {
      if (obj.label === "Color in calendar") {
        this.optionDefault = true;
      }
    }

    if (event.target.type === "checkbox") {
      obj.value = event.target.checked;
    } else {
      obj.forEach((op) => {
        op.checked = false;
      });
      selected.checked = event.target.checked;
    }
  }

  addCategoryOption(event, item) {
    if (event.key === "Enter" && event.target.value) {
      item.selectOptions.push({
        label: event.target.value,
        color: this.categoryColors[0],
        id: uuid(),
      });
      event.target.value = "";
    }
  }

  addCategory(element, item) {
    if (element.value) {
      item.selectOptions.push({
        label: element.value,
        color: this.categoryColors[0],
        id: uuid(),
      });
      element.value = "";
    }
  }

  removeCategoryOption(item, option) {
    item.selectOptions.splice(item.selectOptions.indexOf(option), 1);
  }

  dropCategoryOptions(event: CdkDragDrop<string[]>, item) {
    if(event.previousIndex !== 0 && event.currentIndex !== 0){
      moveItemInArray(
        item.selectOptions,
        event.previousIndex,
        event.currentIndex
      );
     
    }
    
  }

  cdkDragAppItems(event: CdkDrag<any[]>) {
    //  console.log('cdkDragAppItemscdkDragAppItems')
  }

  dropTab(event: CdkDragDrop<any[]>){
    // console.log('cdkDragAppItemscdkDragAppItems')
  }

  toggleCategoryColorMenu(category) {
    if (this.openCategoryColorMenu === category) {
      this.openCategoryColorMenu = "";
    } else {
      this.openCategoryColorMenu = category;
    }
  }

  selectHelpTextItem(index) {
    this.selectedHelpTextItem = index;
    document.getElementById("helpTextModalButton").click();
  }
  selectedRelationItem(index) {
    this.selectedAppItem = index;
    document.getElementById("appModalButton").click();
    this.isModalOpen = true;
  }

  addHelpText(textField) {
    this.selected[this.selectedHelpTextItem].options.find(
      (option) => option.type === "helpText"
    ).value = textField.value;
    textField.value = "";
  }

  getEditAppFields() {
    this.appBuilderService
      .getFields(this.appId)
      .then((jresponse: JReponse) => {
        if (jresponse.body.length) {
          this.editAppFields = jresponse.body;
          if (this.editAppFields && this.editAppFields.length) {
            this.type = "edit";
          } else {
            this.type = "add";
          }
          this.setAppFields();
        } else {
          this.addItem(this.builderOptions[0]);
        }
      })
      .catch((err: Error) => {
        this.type = "add";
        throw err;
      });
  }

  updateCategory(op, event) {
    op.label = event.target.value;
  }

  async setAppFields() {
    for (const field of this.editAppFields) {
      // this.editAppFields.forEach((field) => {
      const fieldObj = JSON.parse(
        JSON.stringify(
          this.builderOptions.find((option) => option.type === field.type)
        )
      );

      // To set label
      fieldObj._id = field._id;
      fieldObj.placeholder = field.label;

      fieldObj.label = field.label;
      fieldObj.label=this.helperService.removeTags(fieldObj.label);
      fieldObj.uniqueId = field.uniqueId;
      fieldObj.formType = "edit";
      if (field.type === "relationship") {
        //  fieldObj.selectedApps = field.options.selectedApps;
        await this.getData(field, fieldObj);
      }
      // To set options
      fieldObj.options.forEach((option: any) => {
        if (option.formulaData) {
          option.formulaData = field.formulaData;
          option.rawFormula = field.rawFormula;
        }
        // For checkbox menu options
        if (field.options[option.label]) {
          option.value = field.options[option.label];
        }
        // For radio options
        if (option.type === "radio") {
          option.options.find(
            (op) => op.label === field.options[option.name]
          ).checked = true;
          option.options.map((op) => {
            if (op.label !== field.options[option.name]) {
              op.checked = false;
            }
          });
        }
        // For help text
        if (option.type === "helpText" && field.options.helpText) {
          option.value = field.options.helpText;
        }
      });
      if (field.type === "calculator") {
        fieldObj.rawFormulaDisplay = field.options.rawFormulaDisplay;
        fieldObj.formulaData = field.options.formulaData;
        fieldObj.rawFormula = field.options.rawFormula;
      }

      // For category field
      if (field.type === "category") {
        fieldObj.selectOptions = JSON.parse(
          JSON.stringify(field.options.selectOptions)
        );
      }
      this.addItem(fieldObj);
    }
  }
  async getData(field, fieldObj) {
    return new Promise<void>((resolve, reject) => {
      this.appBuilderService
        .getAppRelationRecords({
          field_id: field._id,
          app: field.options.selectedApps,
        })
        .then((jresponse: JReponse) => {
          resolve();
          fieldObj.selectedApps = jresponse.body;
          //   fieldObj.records=[];
          const records = _.map(jresponse.body, function (obj) {
            return obj.data;
          });

          let finalData = [];
          for (let i = 0; i < records.length; i++) {
            finalData = [...finalData, ...records[i]];
          }
          fieldObj.records = finalData;
          fieldObj.records.forEach( record => {
            if (record && record.categoryObj) {
              const cat = record.categoryObj.find( c => c.id === record.selectedCategory);
              if (cat) {
                record.selectedCategoryColor = cat.color;
              }
            }
          });
        })
        .catch((err: Error) => {
          reject();
          throw err;
        });
    });
  }
  updateLabel(item, event) {
    // item.label = event.target.value;
    if (item.type === "number" || item.type === "money") {
      let result = this.selected.filter((a1) => a1.type == "calculator");
      _.each(result, function (variable) {
        let label = item.label;
        if (variable.rawFormula.includes(item.uniqueId)) {
          let regex = new RegExp("\\b" + label + "\\b", "g"); // same as inv.replace(/\b1x\b/g, "")
          variable.rawFormulaDisplay = variable.rawFormulaDisplay.replace(
            regex,
            event.target.value
          );
        }
      });
    }
    item.label = event.target.value;
  }

  closeAppBuilder() {
    const app = this.appViewService.workspaceAppsList.find(
      (app) => app._id === this.appId
    );
    if (app) {
      this.navigateToApplication(app);
    } else {
      if (this.workspaceId) {
        this.homeService.refreshApps(this.workspaceId, this.homeService.wsRole);
      }
      this.router.navigate(["application/home"]);
    }
  }

  navigateToApplication(app) {
    if (!app) {
      this.router.navigate(["application/home"]);
    } else {

      this.appViewService.selectedLayoutOptions = [{}, {}, {}];
      let url = "/application/home/app-view/applicationView";
      let query = `?appId=${app._id}&workspaceId=${app.workspace_id._id}`;
      if (
        app.view_mode &&
        app.view_mode !== "grid" &&
        app.view_mode !== "gridView"
      ) {
        url += app.view_mode === "kanban" ? "/kanban-view" : "/calender-view";
      }
      if (app.rowId) {
        query += `&row=${app.rowId}`;
      } else {
        this.appViewService.displayRowOption = undefined;
      }
      if (app.columnId) {
        query += `&column=${app.columnId}`;
      } else {
        this.appViewService.displayColumnOption = undefined;
      }
      this.router.navigateByUrl(url + query);
    }
  }
  getWorkspaceListForRelation(event) {
    this.displayApps = true;
    let keyword = event.target.value;
    let query = "";
    if (keyword) {
      query = `?keyword=${keyword}`;
    }
    this.appBuilderService
      .getWsList(query)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          if (jresponse.body.length) {
            jresponse.body.forEach((e) => {
              this.wsList.push({
                ...e,
                isSaved: false,
                isAdded: false,
                role: "all",
                applications: [],
              });
            });
          } else {
            this.wsList = [];
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
  selectWs(ws) {
    this.wsList.forEach((elem) => {
      //  if (elem.applications && elem.applications.length > 0) {
      if (elem._id === ws._id) {
        // elem.applications.forEach((e) => {
        //   if (e._id === innerApp._id) {
        elem.isAdded = true;
        this.selected[this.selectedAppItem].selectedWs.push({
          ...elem,
          // workspace_id: elem._id,
          // workspaceName: elem.name
        });
        // }
        //});
      }
      //}
    });
    this.selected[this.selectedAppItem].selectedWs = _.uniqBy(
      this.selected[this.selectedAppItem].selectedWs,
      "_id"
    );
  }
  getAppListForRelation(event) {
    this.displayApps = true;
    let keyword = event.target.value;
    let orgId = this.helperService.getLocalStore("selectedOrgId");
    let query = "";
    if (keyword) {
      query = `?keyword=${keyword}`;
    }
    this.appBuilderService
      .getAppList(orgId, query)
      .then((jresponse: JReponse) => {
        if (jresponse) {
          if (jresponse.body.length) {
            this.appList = jresponse.body;
            //    return false
            for (let i = 0; i < this.appList.length; i++) {
              let appData = this.appList[i]["applications"];
              for (let j = 0; j < appData.length; j++) {
                appData[j].isAdded = false;
                appData[j].isSaved = false;
                appData[j].role = "all";
                appData[j].records = [];
                appData[j].createdAt = moment(appData[j].createdAt).fromNow();
                // if (
                //   appData[j].owner.avatar &&
                //   appData[j].owner.avatar !== "undefined"
                // ) {
                //   appData[j].owner.avatar =
                //     environment.MEDIA_URL + appData[j].owner.avatar;
                // } else {
                //   appData[j].owner.avatar =
                //     "../../../../../assets/images/user.png";
                // }
              }
            }
          } else {
            this.appList = [];
          }
        }
      })
      .catch((err: any) => {
        throw err;
      });
  }
  selectApp(app, innerApp) {
    this.appList.forEach((elem) => {
      if (elem.applications && elem.applications.length > 0) {
        if (elem._id === app._id) {
          elem.applications.forEach((e) => {
            if (e._id === innerApp._id) {
              this.appBuilderService
                .getViewList(innerApp.id)
                .then((jresponse: JReponse) => {
                  let teamView;
                  let privateView;
                  if (jresponse.body.length) {
                    //   let viewData=jresponse.body;

                    jresponse.body.forEach((value) => {
                      if (value.type == "team") {
                        teamView = value.list;
                      } else {
                        privateView = value.list;
                      }
                    });
                  }
                  e.isAdded = true;
                  this.selected[this.selectedAppItem].selectedApps.push({
                    ...e,
                    workspace_id: elem._id,
                    workspaceName: elem.name,
                    teamView: teamView,
                    privateView: privateView,
                  });
                })
                .catch((err: Error) => {
                  throw err;
                });
            }
          });
        }
      }
    });
    this.selected[this.selectedAppItem].selectedApps = _.uniqBy(
      this.selected[this.selectedAppItem].selectedApps,
      "_id"
    );
  }
  removeSeletedApps(app) {
    let field_id = this.selected[this.selectedAppItem]._id;
    let appId = app._id;
    this.appBuilderService
      .removeAppFromField({ field_id: field_id, application_id: appId })
      .then((jresponse: JReponse) => {
        this.selected[this.selectedAppItem].selectedApps.filter(
          (elem, index) => {
            if (elem._id === app._id) {
              this.selected[this.selectedAppItem].selectedApps.splice(index, 1);
            }
          }
        );
      })
      .catch((err: Error) => {
        throw err;
      });
  }
  modalClosed(event) {
    if (
      this.isModalOpen &&
      event &&
      (event.target.id === "closeAppModal" ||
        event.target.className === "modal fade")
    ) {
      this.selected[this.selectedAppItem].selectedApps.filter((elem, index) => {
        if (elem.isSaved == false) {
          this.selected[this.selectedAppItem].selectedApps.splice(index, 1);
        }
      });

      this.isModalOpen = false;
      // this.selectedApps = [];
    }
  }
  hideShowApps(option) {
    if (option) {
      this.displayApps = false;
    } else {
      this.displayApps = !this.displayApps;
    }
  }
  addApp(item) {
    item.forEach((element) => {
      delete element.teamView;
      delete element.privateView;
      //  delete element.organization_id;
      delete element.workspaceName;
      delete element.workspace_id;
      element.isSaved = true;
    });
    this.selected[this.selectedAppItem].selectedApps = item;
    this.appArray.push(this.fb.control("Relationship"));

    this.isModalOpen = false;
  }
  getRole(event, selectedApps) {
    selectedApps.role = event.target.value;
  }
  getViews(appId) {
    this.appBuilderService
      .getViewList(appId)
      .then((jresponse: JReponse) => {
        if (jresponse.body.length) {
          //   let viewData=jresponse.body;
          jresponse.body.forEach((value) => {
            if (value.type == "team") {
              this.teamView = value.list;
            } else {
              this.privateView = value.list;
            }
          });
        }
      })
      .catch((err: Error) => {
        throw err;
      });
  }
}
