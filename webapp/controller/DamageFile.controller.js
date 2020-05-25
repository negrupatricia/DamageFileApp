sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Fragment, Filter, FilterOperator, MessageToast) {
	"use strict";
	jQuery.sap.require('sap.m.MessageToast');

	return Controller.extend("damageFile.DamageFiles.controller.DamageFile", {

		onInit: function () {

			var oView = this.getView();
			oView.setModel(this.getOwnerComponent().getModel("damageFileService"), "damageFileService");
			oView.setModel(this.getOwnerComponent().getModel("customerService"), "customerService");
			oView.setModel(this.getOwnerComponent().getModel("countyService"), "countyService");
			oView.setModel(this.getOwnerComponent().getModel("carMakeService"), "carMakeService");
			oView.setModel(this.getOwnerComponent().getModel("carPolicyService"), "carPolicyService");

			var DamageHist = new JSONModel({
				aEntries: []
			});
			oView.setModel(DamageHist, "DamageHist");
			var InsuredCar = new JSONModel({
				aEntries: []
			});
			oView.setModel(InsuredCar, "InsuredCar");
			var oButtonsModel = new JSONModel({
				enabledArchiveDamageFile: true,
				enabledCreateDamageFile: false,
				enabledClearDamageFile: false

			});
			oView.setModel(oButtonsModel, "oButtonsModel");
			var young = 0, medium = 0, senior = 0;
			oView.getModel("customerService").read("/ZINS_C_CUSTOMERTP", {
				method: "GET",
				success: function (oData) {
					for (var i = 0; i < oData.results.length; i++) {
						if (parseInt(oData.results[i].age) > 17 && parseInt(oData.results[i].age) < 31) {
							young++;
						} else if (parseInt(oData.results[i].age) > 30 && parseInt(oData.results[i].age) < 61) {
							medium++;
						} else {
							senior++;
						}
					}
					var oCustomerAgeModel = new JSONModel({
						"pieData": [
							{
								"group": "18-30 years",
								"percentage": young
							},
							{
								"group": "31-60 years",
								"percentage": medium
							},
							{
								"group": ">60 years",
								"percentage": senior
							}]
					})
					oView.setModel(oCustomerAgeModel, "oCustomerAgeModel");
				}.bind(this),
				error: function (oError) {
				}
			});

			var oInput = this.byId('dmgfileCustomer');
			oInput.setSuggestionRowValidator(this.suggestionRowValidator);

			var oInputInsuredCar = this.byId('insuredCar');
			oInput.setSuggestionRowValidator(this.suggestionRowValidatorInsuredCar);

			oView.getModel("damageFileService").read("/ZINS_C_DMGFILETP", {
				method: "GET",
				success: function (oData) {
					for (var i = 0; i < oData.results.length; i++) {
						oView.getModel("customerService").read("/ZINS_C_CUSTOMERTP(" + oData.results[i].cust_id + ")", {
							method: "GET",
							success: function (oDataC) {
								if (parseInt(oDataC.age) > 17 && parseInt(oDataC.age) < 31) {
									young++;
								} else if (parseInt(oDataC.age) > 30 && parseInt(oCData.age) < 61) {
									medium++;
								} else {
									senior++;
								}
								var oDamageCustomerAgeModel = new JSONModel({
									"pieData": [
										{
											"group": "18-30 years",
											"percentage": young
										},
										{
											"group": "31-60 years",
											"percentage": medium
										},
										{
											"group": ">60 years",
											"percentage": senior
										}]
								})
								oView.setModel(oDamageCustomerAgeModel, "oDamageCustomerAgeModel");

							}.bind(this),
							error: function (oError) {
							}
						});

					}
				}.bind(this),
				error: function (oError) {

				}
			})
		},

		_enableButtons: function (oEvent) {

			var selectedItem = oEvent.getParameters().item.getProperty("key");
			var oButtonsModel = this.getView().getModel("oButtonsModel");
			this.getView().byId("damageFilesTable").setMode(sap.m.ListMode.None);
			//oButtonsModel.setProperty("/enabledArchiveDamageFile", true);
			if (selectedItem === "createDamageFileKey") {
				oButtonsModel.setProperty("/enabledArchiveDamageFile", false);
				oButtonsModel.setProperty("/enabledCreateDamageFile", true);
				oButtonsModel.setProperty("/enabledClearDamageFile", true);
			} else if (selectedItem === "viewDamageHistoryFileKey") {
				oButtonsModel.setProperty("/enabledArchiveDamageFile", false);
				oButtonsModel.setProperty("/enabledCreateDamageFile", false);
				oButtonsModel.setProperty("/enabledClearDamageFile", false);
			} else if (selectedItem === "dataAnalysisFileKey") {
				oButtonsModel.setProperty("/enabledArchiveDamageFile", false);
				oButtonsModel.setProperty("/enabledCreateDamageFile", false);
				oButtonsModel.setProperty("/enabledClearDamageFile", false);
			} else if (selectedItem === "viewDamageFileKey") {
				oButtonsModel.setProperty("/enabledArchiveDamageFile", true);
				oButtonsModel.setProperty("/enabledCreateDamageFile", false);
				oButtonsModel.setProperty("/enabledClearDamageFile", false);
			}
		},

		_onItemSelect: function (oEvent) {
			var item = oEvent.getParameter('item');
			var viewId = this.getView().getId();
			sap.ui.getCore().byId(viewId + "--welcomePageContainer").to(viewId + "--" + item.getKey());
		},
		onFilterSearch: function (oEvent) {
			var oView = this.getView();
			var aFilter = [];
			var customer = [];

			var sQuery = oEvent.getParameter("query");
			if (sQuery) {

				oView.getModel("damageFileService").read("/ZINS_C_DMGFILETP", {
					method: "GET",
					success: function (oData) {
						for (var i = 0; i < oData.results.length; i++) {
							customer.push(oData.results[i].cust_id);
							if (customer[i] === parseInt(sQuery)) {
								aFilter.push(new Filter("cust_id", FilterOperator.EQ, oData.results[i].cust_id));
							}
						}
						var oTable = oView.byId("damageFilesTable");
						var oBinding = oTable.getBinding("items");
						oBinding.filter(aFilter);

					}, error: function () { }
				});
			}
			else {
				var oTable = oView.byId("damageFilesTable");
				var oBinding = oTable.getBinding("items");
				oBinding.filter(aFilter);
			}
		},

		onSelectChange: function () {

			this.oSelectedCounty = this.getSelect("slCounty");

			var aCurrentFilterValues = [];
			if (this.oSelectedCounty.getSelectedItem() !== null) {
				aCurrentFilterValues.push(new Filter("county_id", FilterOperator.EQ, this.oSelectedCounty.getSelectedItem().mProperties.key));
			}
			this.filterTable(aCurrentFilterValues);
		},
		filterTable: function (aCurrentFilterValues) {
			this.getTableItems().filter(aCurrentFilterValues);
		},
		getTableItems: function () {
			return this.getTable().getBinding("items");
		},
		getTable: function () {
			return this.getView().byId("damageFilesTable");
		},
		getSelect: function (sId) {
			return this.getView().byId(sId);
		},
		onReset: function () {
			this.getSelect("slCounty").setSelectedItem(null);
			var aCurrentFilterValues = [];
			this.filterTable(aCurrentFilterValues);
		},
		_onOpenCustomerDataDialog: function () {
			this._getDialogCustomerData().open();

		},
		_onCloseCustomerDataDialog: function () {
			this._getDialogCustomerData().close();
		},
		_getDialogCustomerData: function () {

			if (!this.customerData) {
				this.customerData = sap.ui.xmlfragment("customerData",
					"damageFile.DamageFiles.view.fragments.CustomerDataTable", this);
				this.getView().addDependent(this.customerData);
			}
			return this.customerData;
		},
		_onCustomerDataValueHelpRequest: function () {
			var oDelayModel = new JSONModel({
				busy: false,
				delay: 0
			});
			oDelayModel.setProperty("/busy", true);
			oDelayModel.setProperty("/delay", 0);
			this._onOpenCustomerDataDialog();
		},
		_onRetrieveDamageHistory: function () {

			var oView = this.getView();
			var aSelectedItems = [];
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var aVariants = [];

			var oDelayModel = new JSONModel({
				busy: false,
				delay: 0
			});
			oDelayModel.setProperty("/busy", true);
			oDelayModel.setProperty("/delay", 0);
			this.getView().setModel(oDelayModel, "gradedDelay");
			var aItems = sap.ui.getCore().byId("customerData--CustomerTable").getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getSelected()) {
					aSelectedItems.push(aItems[i]);
				}
			}

			if (aSelectedItems.length === 0) {
				MessageToast.show(oBundle.getText("noCustomerSelected"));
			} else {
				this.getView().byId("dmgHistoryPanel").setVisible(true);
				var rating = aSelectedItems[0].mAggregations.cells[8].mProperties.text;
				var first_name = aSelectedItems[0].mAggregations.cells[1].mProperties.text;
				var last_name = aSelectedItems[0].mAggregations.cells[2].mProperties.text;
				var cnp = aSelectedItems[0].mAggregations.cells[3].mProperties.text;

				this.getView().byId("CustomerRating").setText(rating);
				this.getView().byId("CustomerFirstName").setText(first_name);
				this.getView().byId("CustomerLastName").setText(last_name);
				this.getView().byId("CustomerCNP").setText(cnp);

				var id = aSelectedItems[0].mAggregations.cells[0].mProperties.text;
				var oFilterID = new Filter("cust_id", FilterOperator.EQ, id);


				var that = this;

				that.getView().getModel("damageFileService").read("/ZINS_C_DMGFILETP", {
					method: "GET",
					filters: [oFilterID],
					success: function (oData) {
						oView.getModel("DamageHist").getData().aEntries = []
						that.getView().byId("DamageFiles").setText(oData.results.length);
						if (oData.results.length === 0) {
							MessageToast.show(oBundle.getText("noDamageHistory"));
						}
						else {
							for (var i = 0; i < oData.results.length; i++) {
								if (oData.results[i].total_damage) {
									oData.results[i]["total_damage"] = "Yes";
								}
								else oData.results[i]["total_damage"] = "No";

								if (oData.results[i].isarchived) {
									oData.results[i]["isarchived"] = "Closed";
								}
								else oData.results[i]["isarchived"] = "Active";
								oView.getModel("DamageHist").getProperty("/aEntries").push(oData.results[i]);
							}
							oView.getModel("DamageHist").refresh();
						}
						oDelayModel.setProperty("/busy", false);
					}.bind(this),
					error: function () {
						MessageToast.show(oBundle.getText("nocust"));
					}
				});

			}
			this._onCloseCustomerDataDialog();

		},
		_onSearchCustomers: function (oEvent) {
			var oView = this.getView();
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			aFilter = new Filter({
				filters: [
					new Filter("first_name", FilterOperator.Contains, sQuery),
					new Filter("last_name", FilterOperator.Contains, sQuery),
					new Filter("county_name", FilterOperator.Contains, sQuery),
					new Filter("phonenumber", FilterOperator.Contains, sQuery),
					new Filter("cnp", FilterOperator.Contains, sQuery)
				]
			});

			var oTable = sap.ui.getCore().byId("customerData--CustomerTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilter);
		},
		_onOpenCustomerDataSortDialog: function () {
			this._getDialogCustomerDataSort().open();

		},
		_onCloseCustomerDataSortDialog: function () {
			this._getDialogCustomerDataSort().close();
		},
		_getDialogCustomerDataSort: function () {

			if (!this.sortCustomerData) {
				this.sortCustomerData = sap.ui.xmlfragment("sortCustomerData",
					"damageFile.DamageFiles.view.fragments.SortCustomerDataTable", this);
				this.getView().addDependent(this.sortCustomerData);
			}
			return this.sortCustomerData;
		},

		_onAscendingSortCustomerData: function () {
			var oTable = sap.ui.getCore().byId("customerData--CustomerTable");
			var oBinding = oTable.getBinding("items");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var aSorters = [];

			var sortByName = sap.ui.getCore().byId("sortCustomerData--sortby1").getSelected();
			var sortByCounty = sap.ui.getCore().byId("sortCustomerData--sortby2").getSelected();
			var sortByRating = sap.ui.getCore().byId("sortCustomerData--sortby3").getSelected();

			if (sortByName === true) {
				var mParams = "last_name";
				var sPath = mParams;
				aSorters.push(new sap.ui.model.Sorter(sPath, false));
				oBinding.sort(aSorters);
				this._onCloseCustomerDataSortDialog();
			} else if (sortByCounty === true) {
				var mParams = "county_name";
				var sPath = mParams;
				aSorters.push(new sap.ui.model.Sorter(sPath, false));
				oBinding.sort(aSorters);
				this._onCloseCustomerDataSortDialog();
			} else if (sortByRating === true) {
				var mParams = "rating";
				var sPath = mParams;
				aSorters.push(new sap.ui.model.Sorter(sPath, false));
				oBinding.sort(aSorters);
				this._onCloseCustomerDataSortDialog();
			} else {
				MessageToast.show(oBundle.getText("chooseColumn"));
			}
		},

		_onDescendingSortCustomerData: function () {
			var oTable = sap.ui.getCore().byId("customerData--CustomerTable");
			var oBinding = oTable.getBinding("items");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var aSorters = [];

			var sortByName = sap.ui.getCore().byId("sortCustomerData--sortby1").getSelected();
			var sortByCounty = sap.ui.getCore().byId("sortCustomerData--sortby2").getSelected();
			var sortByRating = sap.ui.getCore().byId("sortCustomerData--sortby3").getSelected();

			if (sortByName === true) {
				//MessageToast.show("Sort descending by Name");
				var mParams = "last_name";
				var sPath = mParams;
				aSorters.push(new sap.ui.model.Sorter(sPath, true));
				oBinding.sort(aSorters);
				this._onCloseCustomerDataSortDialog();
			} else if (sortByCounty === true) {
				var mParams = "county_name";
				var sPath = mParams;
				aSorters.push(new sap.ui.model.Sorter(sPath, true));
				oBinding.sort(aSorters);
				this._onCloseCustomerDataSortDialog();
			} else if (sortByRating === true) {
				var mParams = "rating";
				var sPath = mParams;
				aSorters.push(new sap.ui.model.Sorter(sPath, true));
				oBinding.sort(aSorters);
				this._onCloseCustomerDataSortDialog();
			} else {
				MessageToast.show(oBundle.getText("chooseColumn"));
			}
		},
		_getCountyName: function (county_id) {
			var that = this;
			return new Promise(function (resolve, reject) {
				var oView = that.getView();
				oView.getModel("countyService").read("/ZINS_C_COUNTYTP(" + county_id + ")", {
					method: "GET",
					success: function (oData) {
						resolve(oData.county_name);
					}.bind(this),
					error: function (oError) {
						reject(oError);
					}
				});
			})
		},

		_getCustomerInfo: function (cust_id) {
			var that = this;
			return new Promise(function (resolve, reject) {
				var oView = that.getView();
				oView.getModel("customerService").read("/ZINS_C_CUSTOMERTP(" + cust_id + ")", {
					method: "GET",
					success: function (oData) {
						resolve(oData)
					}.bind(this),
					error: function (oError) {
						reject(oError);
					}
				});
			})
		},

		_getVehicleInfo: function (ins_car_id) {
			var that = this;
			return new Promise(function (resolve, reject) {
				var oView = that.getView();
				oView.getModel("carPolicyService").read("/ZINS_C_INSUREDCARTP(" + ins_car_id + ")", {
					method: "GET",
					success: function (oData) {
						resolve(oData)
					}.bind(this),
					error: function (oError) {
						reject(oError);
					}
				});
			})
		},

		getDialogDamageFileDetails: function () {

			if (!this.damageFileDetailsDialog) {
				this.damageFileDetailsDialog = sap.ui.xmlfragment("damageFileDetailsDialog",
					"damageFile.DamageFiles.view.fragments.ViewDamageFileDetails", this);
				this.getView().addDependent(this.damageFileDetailsDialog);
			}
			return this.damageFileDetailsDialog;
		},

		getEditDialogDamageFile: function () {

			if (!this.editDamageFileDetailsDialog) {
				this.editDamageFileDetailsDialog = sap.ui.xmlfragment("editDamageFileDetailsDialog",
					"damageFile.DamageFiles.view.fragments.EditDamageFileDetails", this);
				this.getView().addDependent(this.editDamageFileDetailsDialog);
			}
			return this.editDamageFileDetailsDialog;
		},

		onCloseDamageFileDialog: function () {
			this.getDialogDamageFileDetails().close();
		},

		onCloseEditDamageFileDialog: function () {
			this.getEditDialogDamageFile().close();
		},

		_validateDeleteDamageFile: function () {
			var oView = this.getView();
			var damageFile = oView.byId("damageFilesTable").getSelectedItem();
			return damageFile;
		},

		editQuestionDetails: async function (oEvent) {
			var county_name, customer_info, vehicle_info, tDamage;
			var oDamageFileId = oEvent.getSource().getParent().getAggregation("cells")[0].getProperty("text");
			var damageFiles = this.getView().byId("damageFilesTable").getBinding("items").getModel().oData;
			var path = "ZINS_C_DMGFILETP(" + oDamageFileId.toLocaleString() + ")";
			var currentDamageFile = damageFiles[path];
			var oDamageFileDetail = new JSONModel({
				delay: 0,
				busy: false,
				description: "",
				file_id: 0,
				car_make: "",
				car_model: "",
				vin: "",
				name: "",
				cnp: "",
				county: "",
				incident_date: "",
				compensation: 0,
				total_damage: false
			});
			oDamageFileDetail.setProperty("/description", currentDamageFile.description);
			oDamageFileDetail.setProperty("/incident_date", currentDamageFile.incident_date);
			oDamageFileDetail.setProperty("/compensation", currentDamageFile.compensation);
			oDamageFileDetail.setProperty("/file_id", currentDamageFile.file_id);
			oDamageFileDetail.setProperty("/delay", 0);
			oDamageFileDetail.setProperty("/busy", true);

			if (currentDamageFile.total_damage === "X") {
				tDamage = true;
			} else {
				tDamage = false;
			}
			oDamageFileDetail.setProperty("/total_damage", tDamage);

			county_name = await this._getCountyName(currentDamageFile.county);
			oDamageFileDetail.setProperty("/county", county_name);

			customer_info = await this._getCustomerInfo(currentDamageFile.cust_id);
			oDamageFileDetail.setProperty("/name", customer_info.first_name + " " + customer_info.last_name);
			oDamageFileDetail.setProperty("/cnp", customer_info.cnp);

			vehicle_info = await this._getVehicleInfo(currentDamageFile.ins_car_id);
			oDamageFileDetail.setProperty("/car_make", vehicle_info.car_name);
			oDamageFileDetail.setProperty("/car_model", vehicle_info.model_name);
			oDamageFileDetail.setProperty("/vin", vehicle_info.vin_number);

			this.getEditDialogDamageFile().setModel(oDamageFileDetail, "damageFileDetail");
			this.getEditDialogDamageFile().open();
			oDamageFileDetail.setProperty("/busy", false);


		},

		onArchiveDamageFile: function () {
			var oView = this.getView();
			var oEntry = {};
			var flag = 0;
			oEntry.isarchived = 'X';
			if (this._validateDeleteDamageFile() === null) {
				MessageToast.show("Please select a damage file!");
				return;
			} else {
				var selectedFileId = oView.byId("damageFilesTable").getSelectedItem().mAggregations.cells[0].mProperties.text;
				oView.getModel("damageFileService").update("/ZINS_C_DMGFILETP(" + selectedFileId.toLocaleString() + ")",
					oEntry, {
					success: function () {
						MessageToast.show("Damage File have been archived successfully!");
						oView.getModel("damageFileService").refresh();
					},
					error: function () { }
				});
			}
		},

		_enableArchiveDamageButton: function () {
			var oView = this.getView();
			oView.byId("archiveDamageFile").setEnabled(true);

		},

		seeDamageFileDetails: async function (oEvent) {
			var county_name, customer_info, vehicle_info;
			var oDamageFileId = oEvent.getSource().getParent().getAggregation("cells")[0].getProperty("text");
			var damageFiles = this.getView().byId("damageFilesTable").getBinding("items").getModel().oData;
			var path = "ZINS_C_DMGFILETP(" + oDamageFileId.toLocaleString() + ")";
			var currentDamageFile = damageFiles[path];
			var oDamageFileDetail = new JSONModel({
				delay: 0,
				busy: false,
				description: "",
				file_id: 0,
				car_make: "",
				car_model: "",
				vin: "",
				name: "",
				cnp: "",
				county: "",
				incident_date: "",
				compensation: 0
			});
			oDamageFileDetail.setProperty("/description", currentDamageFile.description);
			oDamageFileDetail.setProperty("/incident_date", currentDamageFile.incident_date);
			oDamageFileDetail.setProperty("/compensation", currentDamageFile.compensation);
			oDamageFileDetail.setProperty("/file_id", currentDamageFile.file_id);
			oDamageFileDetail.setProperty("/delay", 0);
			oDamageFileDetail.setProperty("/busy", true);

			county_name = await this._getCountyName(currentDamageFile.county);
			oDamageFileDetail.setProperty("/county", county_name);

			customer_info = await this._getCustomerInfo(currentDamageFile.cust_id);
			oDamageFileDetail.setProperty("/name", customer_info.first_name + " " + customer_info.last_name);
			oDamageFileDetail.setProperty("/cnp", customer_info.cnp);

			vehicle_info = await this._getVehicleInfo(currentDamageFile.ins_car_id);
			oDamageFileDetail.setProperty("/car_make", vehicle_info.car_name);
			oDamageFileDetail.setProperty("/car_model", vehicle_info.model_name);
			oDamageFileDetail.setProperty("/vin", vehicle_info.vin_number);

			this.getDialogDamageFileDetails().setModel(oDamageFileDetail, "damageFileDetail");
			this.getDialogDamageFileDetails().open();
			oDamageFileDetail.setProperty("/busy", false);
		},

		onSaveEditDamageFileDialog: function () {
			var oView = this.getView();
			var oDamageModel = this.getEditDialogDamageFile().getModel("damageFileDetail");
			var fileId = oDamageModel.oData.file_id;
			var totalDamage;
			var oDamage = {};

			var damageFileDescription = sap.ui.getCore().byId("editDamageFileDetailsDialog--damageFileDescriptionID").getValue();
			var damageFileTotalDamage = sap.ui.getCore().byId("editDamageFileDetailsDialog--damageFileTotalDamageID").getSelected();
			var damageFileCompensation = sap.ui.getCore().byId("editDamageFileDetailsDialog--damageFileCompensationID").getValue();

			if (damageFileTotalDamage === true) {
				totalDamage = "X";
			} else {
				totalDamage = "";
			}

			oDamage.description = damageFileDescription;
			oDamage.total_damage = totalDamage;
			oDamage.compensation = damageFileCompensation;

			oView.getModel("damageFileService").update("/ZINS_C_DMGFILETP(" + fileId + ")", oDamage, {
				success: function (oResponse) {
					this.getEditDialogDamageFile().close();
					MessageToast.show("Damage file updated!");
				}.bind(this),
				error: function () {
					MessageToast.show("Damage file could not be updated!");
				}
			});
		},

		suggestionRowValidator: function (oColumnListItem) {
			var aCells = oColumnListItem.getCells();

			return new sap.ui.core.Item({
				key: aCells[0].getText(),
				text: aCells[1].getText()
			});
		},

		_suggestionItemSelected: function (evt) {

			var oInput = this.byId('dmgfileCustomer'),
				oText = this.byId('selectedKey'),
				sKey = oInput.getSelectedKey();

			oText.setText(sKey);
		},

		_onSubmitSelection: function (oEvent) {
			var oLabel = this.byId('dmgfileCar').setVisible(true),
				oInputInsuredCar = this.byId('insuredCar').setVisible(true),
				oInput = this.byId('dmgfileCustomer'),
				sKey = oInput.getSelectedKey(),
				oFilterCustID = new Filter("cust_id", FilterOperator.EQ, sKey),
				that = this,
				aActivePolicies = [],
				myDate = new Date(),
				hasActivePolicy = 0;

			that.getView().getModel("carPolicyService").read("/ZINS_C_CARPOLICYTP", {
				method: "GET",
				filters: [oFilterCustID],
				success: function (oData) {
					if (oData.results.length == 0) {
						that.byId('dmgfileCustomer').setValueState(sap.ui.core.ValueState.Error);
						that.byId('dmgfileCustomer').setValueStateText("The selected user does not have a policy!");
					}
					else {
						that.byId('dmgfileCustomer').setValueState(sap.ui.core.ValueState.None);
						hasActivePolicy = 0;
						for (var i = 0; i < oData.results.length; i++) {
							if (oData.results[i]["end_date"] > myDate) {
								hasActivePolicy = 1;
								aActivePolicies.push(oData.results[i]["policy_id"]);
							}
						}

						if (hasActivePolicy === 0) {
							that.byId('dmgfileCustomer').setValueState(sap.ui.core.ValueState.Error);
							that.byId('dmgfileCustomer').setValueStateText("The selected user does not have an active policy!");
						}
						else {
							this._findInsuredCars(aActivePolicies);
						}
					}
				}.bind(this),
				error: function () {
					MessageToast.show("The selected user does not exist!");
				}
			});

		},
		_findInsuredCars: function (aActivePolicies) {
			var oView = this.getView();
			oView.getModel("InsuredCar").getData().aEntries = [];

			for (var i = 0; i < aActivePolicies.length; i++) {
				oView.getModel("carPolicyService").read("/ZINS_C_CARPOLICYTP(" + aActivePolicies[i] +
					")/to_InsuredCar", {
					method: "GET",
					success: function (oData) {
						oView.getModel("InsuredCar").getProperty("/aEntries").push(oData.results[0]);
						oView.getModel("InsuredCar").refresh();
					},
					error: function () {
						MessageToast.show("The selected user does not exist!");
					}
				});
			}
		},
		suggestionRowValidatorInsuredCar: function (oColumnListItem) {
			var aCells = oColumnListItem.getCells();

			return new sap.ui.core.Item({
				key: aCells[0].getText(),
				text: aCells[1].getText()
			});
		},
		onClearDamageFileData: function () {
			var oView = this.getView();
			this.byId('dmgfileCustomer').setValue("");
			this.byId('selectedKey').setText("");
			this.byId('dmgfilecounty').setSelectedItem(null);
			this.byId('dmgfiledescription').setValue();
			this.byId('dmgfileCar').setVisible(false);
			this.byId('insuredCar').setValue("");
			this.byId('insuredCar').setVisible(false);
			this.byId('dmgfiledate').setValue(null);
			this.byId('dmgfiletime').setValue(null);
			this.byId('dmgfileTotalDamage').setSelected(false);
			this.byId('damageFileCompensationID').setValue(null);
		},
		onCreateDamageFile: function () {
			var oView = this.getView(),
				oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			if (this._validateEntry() === true) {
				var oDamageFile = {};

				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-ddTHH:mm:ss" });
				var dmgfileincident_date = oDateFormat.format(new Date(oView.byId("dmgfiledate").getDateValue()));

				var oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "PTHH'H'mm'M'ss'S'" });
				var dmgfiletime = oTimeFormat.format(new Date(oView.byId('dmgfiletime').getDateValue()));

				if (oView.byId('damageFileCompensationID').getValue() == '') {
					var dmgfilecompensation = "0";
				} else {
					var dmgfilecompensation = oView.byId('damageFileCompensationID').getValue();
				}

				var dmgfilecounty = oView.byId('dmgfilecounty').getSelectedKey(),
					dmgfilecust_id = oView.byId('dmgfileCustomer').getSelectedKey(),
					dmgfileins_car_id = oView.byId('insuredCar').getValue(),
					dmgfiledescription = oView.byId('dmgfiledescription').getValue(),
					damageFileTotalDamage = oView.byId('dmgfileTotalDamage').getSelected(),
					dmgtotalDamage;

				if (damageFileTotalDamage === true) {
					dmgtotalDamage = "X";
				} else {
					dmgtotalDamage = "";
				}


				oDamageFile.compensation = dmgfilecompensation;
				oDamageFile.county = parseInt(dmgfilecounty);
				oDamageFile.cust_id = parseInt(dmgfilecust_id);
				oDamageFile.ins_car_id = parseInt(dmgfileins_car_id);
				oDamageFile.description = dmgfiledescription.toString();
				oDamageFile.incident_date = dmgfileincident_date;
				oDamageFile.time = dmgfiletime;
				oDamageFile.total_damage = dmgtotalDamage;

				var that = this;

				that.getView().getModel("damageFileService").create("/ZINS_C_DMGFILETP", oDamageFile, {
					success: function (oResponse) {
						MessageToast.show(oBundle.getText("postdamagefileSucces"));
						this.onClearDamageFileData();
					}.bind(this),
					error: function () {
						MessageToast.show(oBundle.getText("postdamagefileError"));
					}
				});
			} else {
				MessageToast.show(oBundle.getText("postdamagefileInvalidInput"));
			}
		},

		_validateEntry: function (oEvent) {
			var oView = this.getView(),
				isOkay = true,
				myDate = new Date(),
				sMsg = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("fieldErrorMessage"),
				customerText = oView.byId("dmgfileCustomer").getValue();

			if (customerText === "") {
				oView.byId("dmgfileCustomer").setValueState(sap.ui.core.ValueState.Error);
				oView.byId("dmgfileCustomer").setValueStateText(sMsg);
				isOkay = false;
			} else {
				oView.byId("dmgfileCustomer").setValueState(sap.ui.core.ValueState.None);
			}

			var damageCounty = oView.byId("dmgfilecounty").getSelectedItem();
			if (damageCounty == null) {
				oView.byId("dmgfilecounty").setValueState(sap.ui.core.ValueState.Error);
				oView.byId("dmgfilecounty").setValueStateText(sMsg);
				isOkay = false;
			} else {
				oView.byId("dmgfilecounty").setValueState(sap.ui.core.ValueState.None);
			}

			var damageDescription = oView.byId("dmgfiledescription").getValue();
			if (damageDescription === "") {
				oView.byId("dmgfiledescription").setValueState(sap.ui.core.ValueState.Error);
				oView.byId("dmgfiledescription").setValueStateText(sMsg);
				isOkay = false;
			} else {
				oView.byId("dmgfiledescription").setValueState(sap.ui.core.ValueState.None);
			}

			var insuredCar = oView.byId("insuredCar").getValue();
			if (insuredCar === "") {
				oView.byId("insuredCar").setValueState(sap.ui.core.ValueState.Error);
				oView.byId("insuredCar").setValueStateText(sMsg);
				isOkay = false;
			} else {
				oView.byId("insuredCar").setValueState(sap.ui.core.ValueState.None);
			}

			var testTime = oView.byId("dmgfiletime").getDateValue();
			if (testTime === null) {
				oView.byId("dmgfiletime").setValueState(sap.ui.core.ValueState.Error);
				oView.byId("dmgfiletime").setValueStateText(sMsg);
				isOkay = false;
			} else {
				oView.byId("dmgfiletime").setValueState(sap.ui.core.ValueState.None);
			}
			var filedate = oView.byId("dmgfiledate").getDateValue();
			if (filedate === null) {
				oView.byId("dmgfiledate").setValueState(sap.ui.core.ValueState.Error);
				oView.byId("dmgfiledate").setValueStateText(sMsg);
				isOkay = false;
			} else if (filedate > myDate) {
				oView.byId("dmgfiledate").setValueState(sap.ui.core.ValueState.Error);
				oView.byId("dmgfiledate").setValueStateText(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("invalidDate"));
				isOkay = false;
			}
			else {
				oView.byId("dmgfiledate").setValueState(sap.ui.core.ValueState.None);
			}
			return isOkay;

		}
	});
});