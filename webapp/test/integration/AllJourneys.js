/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"damageFile/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"damageFile/test/integration/pages/DamageFile",
	"damageFile/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "damageFile.view.",
		autoWait: true
	});
});