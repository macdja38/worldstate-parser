/**
 * Created by macdja38 on 2016-07-30.
 */
"use strict";
var files = {
    factions: require("../resources/Factions"),
    languages: require("../resources/Languages"),
    nodes: require("../resources/Nodes"),
    paths: require("../resources/Paths"),
    sortie: require("../resources/Sortie"),
    missionTypes: require("../resources/MissionTypes"),
};

module.exports = (file, key, fallback) => {
    if (files.hasOwnProperty(file)) {
        if (files[file].hasOwnProperty(key)) {
            return files[file][key];
        } else {
            return fallback != null ? fallback : key;
        }
    } else {
        throw `File not found:${file}, files:${Object.keys(files)}`
    }
};