/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"damageFile/DamageFiles/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"damageFile/DamageFiles/test/integration/pages/DamageFile",
	"damageFile/DamageFiles/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "damageFile.DamageFiles.view.",
		autoWait: true
	});
});