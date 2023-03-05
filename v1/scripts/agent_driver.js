const version = "1.0.1.1";
const port = 7498;
const host = "localhost";
const reqString = "/explodingaua/browser_gateway.class?data=";

function doAgentRequest(message, promise, failure) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', "http://" + host + ":" + port + reqString + message, true);
    xhr.onload = () => {
        promise(xhr.responseText);
    };
    xhr.onerror = () => {
        failure(1);
    };
    xhr.onabort = () => {
        failure(2);
    };
    xhr.ontimeout = () => {
        failure(3);
    };
    xhr.send(null);
}

function asyncPingAgent(promise) {
    doAgentRequest("PING", (response) => {
        if (response == "CON_TEST_FAIL") {
            promise(PING_AGENT_CON_TEST_FAILED);
            return;
        }
        var splited = response.split("|");
        if (splited.length != 2) {
            promise(PING_MALFORMED_SIZE);
            return;
        }
        if (splited[0] != "PONG") {
            promise(PING_MALFORMED_PONG);
            return;
        }
        if (splited[1] != version) {
            promise(PING_VERSION_MISMATCH);
            return;
        }
        promise(NO_ERROR);
    }, (status) => {
        if (status == 1) {
            promise(PING_CON_ERROR);
            return;
        }
        if (status == 2) {
            promise(PING_CON_ABORT);
            return;
        }
        if (status == 3) {
            promise(PING_CON_TIMEOUT);
            return;
        }
    });
}

function asyncInterruptAgent(promise) {
    doAgentRequest("INTERRUPT", (response) => {
        if (response != "OK") {
            promise(AGNT_INTERRUPT_UNKNWN);
        }
        promise(NO_ERROR);
    }, (status) => {
        if (status == 1) {
            promise(UPD_CHECK_CON_ERROR);
            return;
        }
        if (status == 2) {
            promise(UPD_CHECK_CON_ABORT);
            return;
        }
        if (status == 3) {
            promise(UPD_CHECK_CON_TIMEOUT);
            return;
        }
    });
}

function asyncCheckForUpdates(promise) {
    doAgentRequest("STARTSCAN", (response) => {
        if (response != "SCANNING") {
            promise(UPD_CHECK_ALREADY_SCANNING);
            return;
        }
        promise(NO_ERROR);
    }, (status) => {
        if (status == 1) {
            promise(UPD_CHECK_CON_ERROR);
            return;
        }
        if (status == 2) {
            promise(UPD_CHECK_CON_ABORT);
            return;
        }
        if (status == 3) {
            promise(UPD_CHECK_CON_TIMEOUT);
            return;
        }
    });
}

function asyncCheckUpdating(promise) {
    doAgentRequest("CHECKSCAN", (response) => {
        if (response == "NOT_SCANNING") {
            promise(UPD_STATUS_NOT_SCANNING);
            return;
        }
        if (response == "SCANNING") {
            promise(RETRY_NON_FATAL);
            return;
        }
        promise(NO_ERROR);
    }, (status) => {
        if (status == 1) {
            promise(UPD_STATUS_CON_ERROR);
            return;
        }
        if (status == 2) {
            promise(UPD_STATUS_CON_ABORT);
            return;
        }
        if (status == 3) {
            promise(UPD_STATUS_CON_TIMEOUT);
            return;
        }
    });
}

function asyncReceiveUpdates(promise) {
    doAgentRequest("RETURN_RESULTS", (response) => {
        if (response == "NO_PACKAGES") {
            promise(UPD_RECEIVE_NO_PACKAGES, null);
            return;
        }
        if (response == "SEARCHING_FAILURE") {
            promise(UPD_RECEIVE_FAIL, null);
            return;
        }
        var sortedPerLines = response.split("\r\n");
        var packagesArray = [];
        sortedPerLines.forEach(val => {
            var splited2 = val.split(",");
            if (splited2.length != 7) {
                return;
            }
            var pkgId = splited2[0].replace("&~coma';", ",");
            var progPath = splited2[1].replace("&~coma';", ",");
            var discoveredVersion = splited2[2].replace("&~coma';", ",");
            var displayName = splited2[3].replace("&~coma';", ",");
            var latestVersion = splited2[4].replace("&~coma';", ",");
            var needsUpdate = splited2[5].replace("&~coma';", ",");
            var description = splited2[6].replace("&~coma';", ",");
            var up = new UpdatePackage(pkgId, progPath, discoveredVersion, displayName, latestVersion, needsUpdate == "true", description);
            packagesArray.push(up);
        })
        promise(NO_ERROR, packagesArray);
    }, (status) => {
        if (status == 1) {
            promise(UPD_RECEIVE_CON_ERROR, null);
            return;
        }
        if (status == 2) {
            promise(UPD_RECEIVE_CON_ABORT, null);
            return;
        }
        if (status == 3) {
            promise(UPD_RECEIVE_CON_TIMEOUT, null);
            return;
        }
    });
}


function asyncInstallUpdates(promise, list) {
    var req = "SINSTALL:";
    list.forEach((c) => {
        req += c + ":";
    });
    doAgentRequest(req, (response) => {
        if (response == "NO_PACKAGES") {
            promise(UPD_INSTALL_NO_PACKAGES, null);
            return;
        }
        promise(NO_ERROR);
    }, (status) => {
        if (status == 1) {
            promise(UPD_INSTALL_CON_ERROR, null);
            return;
        }
        if (status == 2) {
            promise(UPD_INSTALL_CON_ABORT, null);
            return;
        }
        if (status == 3) {
            promise(UPD_INSTALL_CON_TIMEOUT, null);
            return;
        }
    });
}

function asyncFetchInstallResults(promise) {
    doAgentRequest("INSTALL_RESULTS", (response) => {
        if (response == "INSTALLING") {
            promise(RETRY_NON_FATAL, null);
            return;
        } else {
            var sortedPerLines = response.split("\r\n");
            var resultsArray = [];
            sortedPerLines.forEach(val => {
                var splited2 = val.split(",");
                if (splited2.length != 8) {
                    return;
                }
                var progPath = splited2[0].replace("&~coma';", ",");
                var discoveredVersion = splited2[1].replace("&~coma';", ",");
                var displayName = splited2[2].replace("&~coma';", ",");
                var latestVersion = splited2[3].replace("&~coma';", ",");
                var needsUpdate = splited2[4].replace("&~coma';", ",");
                var description = splited2[5].replace("&~coma';", ",");
                var status = splited2[6];
                var date = splited2[7];
                var up = new UpdatePackage(null, progPath, discoveredVersion, displayName, latestVersion, needsUpdate == "true", description); // null package id, it is useless
                var res = new InstallResult(up, status == "SUCCESS", Number(date));
                resultsArray.push(res);
            })
            promise(NO_ERROR, resultsArray);
        }
    }, (status) => {
        if (status == 1) {
            promise(UPD_INSTALL_RES_CON_ERROR, null);
            return;
        }
        if (status == 2) {
            promise(UPD_INSTALL_RES_CON_ABORT, null);
            return;
        }
        if (status == 3) {
            promise(UPD_INSTALL_RES_CON_TIMEOUT, null);
            return;
        }
    });
}

function asyncFetchUpdatesHistory(promise) {
    doAgentRequest("UPDATES_HISTORY", (response) => {
        if (response == "HISTORY_FAIL") {
            promise(UPD_HISTORY_LOAD_FAIL, null);
            return;
        } else {
            var sortedPerLines = response.split("\r\n");
            var resultsArray = [];
            sortedPerLines.forEach(val => {
                var splited2 = val.split(",");
                if (splited2.length != 8) {
                    return;
                }
                var progPath = splited2[0].replace("&~coma';", ",");
                var discoveredVersion = splited2[1].replace("&~coma';", ",");
                var displayName = splited2[2].replace("&~coma';", ",");
                var latestVersion = splited2[3].replace("&~coma';", ",");
                var needsUpdate = splited2[4].replace("&~coma';", ",");
                var description = splited2[5].replace("&~coma';", ",");
                var status = splited2[6];
                var date = splited2[7];
                var up = new UpdatePackage(null, progPath, discoveredVersion, displayName, latestVersion, needsUpdate == "true", description); // null package id, it is useless
                var res = new InstallResult(up, status == "SUCCESS", Number(date));
                resultsArray.push(res);
            })
            promise(NO_ERROR, resultsArray);
        }
    }, (status) => {
        if (status == 1) {
            promise(UPD_HISTORY_CON_ERROR, null);
            return;
        }
        if (status == 2) {
            promise(UPD_HISTORY_CON_ABORT, null);
            return;
        }
        if (status == 3) {
            promise(UPD_HISTORY_CON_TIMEOUT, null);
            return;
        }
    });
}
