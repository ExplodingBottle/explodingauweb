var jsDisplay;
var chkUpds;
var instUpds;
var interruptAgnt;

var lastPackagesList;

function dispError(id) {
    jsDisplay.innerHTML = "An error occured. Error code: " + id;
}

function computeList() {
    var list = [];
    lastPackagesList.forEach(pkg => {
        var elem = document.getElementById("pckg" + pkg.id);
        if (elem.checked) {
            list.push(pkg.id);
        }
    });
    return list;
}

function chkBoxUpd() {
    var toUpd = computeList();
    if (toUpd.length > 0) {
        instUpds.disabled = false;
    } else {
        instUpds.disabled = true;
    }
}

function loopInstallChecking() {
    function checking(status) {
        if (status == RETRY_NON_FATAL) {
            loopInstallChecking();
        } else if (status == NO_ERROR) {
            jsDisplay.innerHTML = "All the selected updates were installed !";
        } else {
            dispError(status);
        }
    }
    asyncFetchInstallResults(checking);
}

function installUpdates(status) {
    if (status != NO_ERROR) {
        dispError(status);
    } else {
        loopInstallChecking();
    }
}

function checkAll() {
    lastPackagesList.forEach(pkg => {
        var elem = document.getElementById("pckg" + pkg.id);
        if (!elem.disabled) {
            elem.checked = true;
        }
    });
    chkBoxUpd();
}

function clearAll() {
    lastPackagesList.forEach(pkg => {
        var elem = document.getElementById("pckg" + pkg.id);
        elem.checked = false;
    });
    chkBoxUpd();
}

function retreiveUpdates(status, packages) {
    if (status != NO_ERROR) {
        dispError(status);
    } else {
        lastPackagesList = packages;
        var bmsg = "Here is the list of programs and updates: <br><br>";
        bmsg += "<button onclick='checkAll();'>Check all</button>";
        bmsg += "<button onclick='clearAll();'>Clear all</button><br><br><div class='upd-list'>";
        packages.forEach((package) => {
            bmsg += "<div class='upd-element'><input type='checkbox'";
            if (!package.updateRequired) {
                bmsg += " disabled";
            }
            var desc = package.description;
            if (desc == "null") {
                desc = "Unknown description."
            }
            bmsg += " onchange='chkBoxUpd();' id='pckg" + package.id + "'>";
            bmsg += package.displayName + " - Current version: " + package.currentVersion + "<br>";
            bmsg += "Latest version: " + package.latestVersion + "<br>";
            if (package.path != "null") {
                bmsg += "Found at: <b>" + package.path + "</b><br>";
            }
            bmsg += "<br><i>"
            bmsg += desc
            bmsg += "</i></div><br>";
        });
        bmsg += "</div><br><br>";
        bmsg += "<button id='install' disabled>Install updates</button>";
        jsDisplay.innerHTML = bmsg;
        instUpds = document.getElementById("install");
        instUpds.onclick = () => {
            var toUpd = computeList();
            jsDisplay.innerHTML = "Downloading and installing the selected updates...<br><br>";
            jsDisplay.innerHTML += "<progress></progress>";
            asyncInstallUpdates(installUpdates, toUpd)
        };
    }
}

function loopUpdateChecking() {
    function checking(status) {
        if (status == RETRY_NON_FATAL) {
            loopUpdateChecking();
        } else if (status == NO_ERROR) {
            asyncReceiveUpdates(retreiveUpdates);
        } else {
            dispError(status);
        }
    }
    asyncCheckUpdating(checking);
}

function onCheckUpdate(status) {
    if (status != NO_ERROR) {
        dispError(status);
    } else {
        loopUpdateChecking();
    }
}

function initiateAgentDl() {
    doAgentDownload(true);
}

function onPingEnd(status) {
    if (status != NO_ERROR) {
        if (status == PING_CON_ERROR || status == PING_CON_TIMEOUT) {
            jsDisplay.innerHTML = "It seems like the ExplodingAU client is not launched. If you don't have it, please download it.<br><button onclick='initiateAgentDl();'>Download the agent</button><br>" +
                "<br>Also, please check that no anti-advertisers are enabled, this may disrupt the service. <br>Error code: " + status;
        } else if (status == PING_VERSION_MISMATCH) {
            interruptAgnt.disabled = false;
            jsDisplay.innerHTML = "It seems like the ExplodingAU client is outdated. Please download the latest verson.<br><button onclick='initiateAgentDl();'>Download the agent</button><br>" +
                "<br>Also, please check that no anti-advertisers are enabled, this may disrupt the service. <br>Error code: " + status;
        } else {
            dispError(status);
        }
    } else {
        jsDisplay.innerHTML = "Welcome to ExplodingAU Update Website !<br><br>";
        jsDisplay.innerHTML += "<button id='chkUpds'>Check for updates now</button>";
        chkUpds = document.getElementById("chkUpds");
        interruptAgnt.disabled = false;
        chkUpds.onclick = () => {
            jsDisplay.innerHTML = "Checking for updates...<br><br>";
            jsDisplay.innerHTML += "<progress></progress>";
            asyncCheckForUpdates(onCheckUpdate);
        };
    }
}

function receiveInterruptAgent(status) {
    if (status != NO_ERROR) {
        dispError(status);
    } else {
        jsDisplay.innerHTML = "The agent has been shut down!";
        interruptAgnt.disabled = true;
    }
}

function interruptAgent() {
    asyncInterruptAgent(receiveInterruptAgent);
    jsDisplay.innerHTML = "Shutting down the agent...";
}

function startWebsite() {
    interruptAgnt = document.getElementById("interruptAgent");
    jsDisplay = document.getElementById("jsDisp");
    jsDisplay.innerHTML = "Checking that ExplodingAU component is launched...";
    interruptAgnt.onclick = interruptAgent;
    asyncPingAgent(onPingEnd);
}

window.onload = startWebsite;
