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
		}
	});
});