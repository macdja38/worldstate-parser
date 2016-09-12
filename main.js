/**
 * Created by macdja38 on 2016-07-30.
 */
"use strict";
var Config = require('./lib/config');
var request = require("request");
var r = require('rethinkdb');

var auth = new Config('auth');
var config = new Config('config');

var conn = r.connect(auth.get("reThinkDB"));

var platformLinks = config.get("platformURL");

var platformsEnabled = config.get("platforms");

var alerts = require("./parsers/alerts");

var platforms = [];

platformsEnabled.forEach((platform)=> {
    platforms.push(platformLinks[platform])
});

if (platforms.length < 1) {
    throw "At least one platform must be present in the config file."
}

conn.then((conn)=> {
    r.tableList().contains("alertsV2")
        .do((databaseExists) => {
            return r.branch(
                databaseExists,
                {dbs_created: 0},
                r.tableCreate("alertsV2")
            );
        }).run(conn).then(()=> {
            setInterval(()=> {
                checkState(conn)
            }, config.get("pollingRateMS") / platforms.length)
        }).catch(console.error.bind(this))
}).catch(console.error.bind(this));

function checkState(conn) {
    cycleArray(platforms);
    getState(platforms[0]).then((state)=> {
        parseLogState(state, conn);
    });

}

function cycleArray(array) {
    array.push(array.shift())
}

function getState(platform) {
    console.log(`Fetching ${platform.name} from ${platform.url}`);
    return new Promise((resolve, reject)=> {
        request({
            url: platform.url,
            json: true
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve({platform: platform.name, url: platform.url, body: body});
                console.log("Fetch Successful".green);
            } else {
                reject(error);
                console.error("Fetch Failed");
                console.error(error);
            }
        });
    })
}

function parseLogState(state, conn) {
    r.table("alertsV2").insert(alerts(state), {conflict: "replace"}).run(conn);
    console.log(alerts(state));
}

/*
 conn.then((conn)=> {
 r.table("worldState").get(this.platform).run(conn).then((body)=> {
 this.lastFech = Date.now();
 this.state = body;
 }
 )
 });
 */