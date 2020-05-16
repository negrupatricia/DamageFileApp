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
			var DamageHist = new JSONModel({
				aEntries: []
			});
			oView.setModel(DamageHist, "DamageHist");
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
				oView.getModel("customerService").read("/ZINS_C_INSUREDCARTP(" + ins_car_id + ")", {
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

		seeDamageFileDetails: async function (oEvent) {
			var county_name, customer_info, vehicle_info;
			var oDamageFileId = oEvent.getSource().getParent().getAggregation("cells")[0].getProperty("text");
			var damageFiles = this.getView().byId("damageFilesTable").getBinding("items").getModel().oData;
			var path = "ZINS_C_DMGFILETP(" + oDamageFileId.toLocaleString() + ")";
			var currentDamageFile = damageFiles[path];
			var oDamageFileDetail = new JSONModel({
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

			county_name = await this._getCountyName(currentDamageFile.county);
			oDamageFileDetail.setProperty("/county", county_name);

			customer_info = await this._getCustomerInfo(currentDamageFile.cust_id);
			oDamageFileDetail.setProperty("/name", customer_info.first_name + " " + customer_info.last_name);
			oDamageFileDetail.setProperty("/cnp", customer_info.cnp);

			vehicle_info = await _getVehicleInfo(currentDamageFile.ins_car_id);
			oDamageFileDetail.setProperty("/car_make", vehicle_info.car_name);
			oDamageFileDetail.setProperty("/car_model", vehicle_info.model_name);
			oDamageFileDetail.setProperty("/vin", vehicle_info.vin_number);


		}
	});
});