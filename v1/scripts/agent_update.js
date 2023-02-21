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

const endpoint = "https://explodingbottle.github.io/eaudl/v1";

const agentDl = "/agent/agentlatest.ln";

function loopPingChecking() {
    function checking(status) {
        if (status == PING_CON_ERROR) {
            loopPingChecking();
        } else if (status == NO_ERROR) {
            window.location.replace("../");
        } else {
            dlDiv.innerHTML = "Failed to check agent status due to error " + status + ".";
        }
    }
    asyncPingAgent(checking);
}

function precipitateDownload(url) {
    var built = "<iframe style='display: none;visibility: hidden;' src='" + url + "'></iframe>"
    document.body.innerHTML += built;
    loopPingChecking();
}

window.onload = () => {
    console.log("Retreiving path to agent...");
    const dlDiv = document.getElementById("dlDiv");
    const xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint + agentDl, true);
    xhr.onload = () => {
        var link = xhr.responseText;
        console.log("Retreived link: " + link);
        precipitateDownload(link);
    };
    xhr.onerror = () => {
        dlDiv.innerHTML = "Failed to download the agent because an error occured in the connection.";
    };
    xhr.onabort = () => {
        dlDiv.innerHTML = "Failed to download the agent because an the connection has been aborted.";
    };
    xhr.ontimeout = () => {
        dlDiv.innerHTML = "Failed to download the agent because a timeout occured.";
    };
    xhr.send(null);
};
