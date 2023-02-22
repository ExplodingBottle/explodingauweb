/*
 *   ExplodingAU Website - The website for ExplodingAU
 *   Copyright (C) 2023  ExplodingBottle
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

var jsDisplay;
var chkUpds;
var instUpds;
var interruptAgnt;

var lastPackagesList;

var toUpd = [];

function dispError(id) {
    jsDisplay.innerHTML = "An error occured. Error code: " + id;
}

function chkBoxUpd(id) {
    var found = toUpd.indexOf(id);
    if (found == -1) {
        toUpd.push(id);
    } else {
        toUpd.splice(found, 1);
    }
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

function retreiveUpdates(status, packages) {
    if (status != NO_ERROR) {
        dispError(status);
    } else {
        lastPackagesList = packages;
        var bmsg = "Here is the list of programs and updates: <br><br>";
        packages.forEach((package) => {
            bmsg += "<input type='checkbox'";
            if (!package.updateRequired) {
                bmsg += " disabled";
            }
            bmsg += " onchange='chkBoxUpd(" + package.id + ");'>";
            bmsg += package.displayName + " - Current version: " + package.currentVersion + "<br>";
            bmsg += "Latest version: " + package.currentVersion + "<br>";
            bmsg += "Found at: " + package.path + "<br>";
            bmsg += "<br>";
        });
        bmsg += "<br><br>";
        bmsg += "<button id='install' disabled>Install updates</button>";
        jsDisplay.innerHTML = bmsg;
        instUpds = document.getElementById("install");
        instUpds.onclick = () => {
            jsDisplay.innerHTML = "Downloading and installing the selected updates...";
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

function onPingEnd(status) {
    if (status != NO_ERROR) {
        if (status == PING_CON_ERROR || status == PING_CON_TIMEOUT) {
            jsDisplay.innerHTML = "It seems like the ExplodingAU client is not launched. If you don't have it, please download it <a href='agent_dl.html'>here</a>.<br>" +
                "Also, please check that no anti-advertisers are enabled, this may disrupt the service. <br>Error code: " + status;
        } else if (status == PING_VERSION_MISMATCH) {
            jsDisplay.innerHTML = "It seems like the ExplodingAU client is outdated. Please download the latest verson at <a href='agent_dl.html'>here</a>.<br>" +
            "Also, please check that no anti-advertisers are enabled, this may disrupt the service. <br>Error code: " + status;
        } else {
            dispError(status);
        }
    } else {
        jsDisplay.innerHTML = "Welcome to ExplodingAU Update Website !<br>";
        jsDisplay.innerHTML += "<button id='chkUpds'>Check for updates now</button>";
        chkUpds = document.getElementById("chkUpds");
        interruptAgnt.disabled = false;
        chkUpds.onclick = () => {
            jsDisplay.innerHTML = "Checking for updates...";
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

window.onload = () => {
    interruptAgnt = document.getElementById("interruptAgent");
    jsDisplay = document.getElementById("jsDisp");
    jsDisplay.innerHTML = "Checking that ExplodingAU component is launched...";
    interruptAgnt.onclick = interruptAgent;
    asyncPingAgent(onPingEnd);
};
