/**
 * Created by macdja38 on 2016-07-30.
 */
"use strict";

var k = require('../lib/getKeyedResource');

module.exports = function (state) {
  if (state.body.hasOwnProperty("Alerts")) {
    var alerts = state.body["Alerts"];
    let returns = [];
    alerts.forEach((alert)=> {
      let alertObject = {};
      alertObject.rawAlert = alert;
      alertObject.start = alert.Activation.sec;
      alertObject.end = alert.Expiry.sec;
      let MissionInfo = alert.MissionInfo;
      alertObject.missionType = k("missionTypes", MissionInfo.missionType);
      alertObject.faction = k("factions", MissionInfo.faction);
      let location = k("nodes", MissionInfo.location);
      if (location.hasOwnProperty("missionTag")) {
        alertObject.location = location.missionTag
      } else {
        alertObject.location = location;
      }
      alertObject.minLevel = MissionInfo.minEnemyLevel;
      alertObject.maxLevel = MissionInfo.maxEnemyLevel;
      if (MissionInfo.archwingRequired === true) {
        alertObject.archwingRequired = true;
      }
      let missionReward = MissionInfo.missionReward;
      var reward = {};
      if (missionReward.credits) {
        reward.credits = missionReward.credits;
      }
      if (missionReward.items) {
        reward.items = missionReward.items.map((item)=> {
          item = k("paths", item);
          return { name: k("languages", item.LocalizeTag), category: item.ProductCategory }
        })
      }
      if (missionReward.countedItems) {
        reward.countedItems = missionReward.countedItems.map((item)=> {
          let object = k("paths", item);
          return { count: item.itemCount, type: k("languages", item.localizeTag), category: item.ProductCategory }
        })
      }
      alertObject.reward = reward;
      returns.push(alertObject);
    });
    return { id: state.platform, alerts: returns };
  } else {
    return false;
  }
};
