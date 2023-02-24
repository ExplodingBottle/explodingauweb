const endpoint = "https://explodingbottle.github.io/eaudl/v1";

const agentDl = "/agent/agentlatest.ln";

function loopPingChecking() {
    function checking(status) {
        if (status == PING_CON_ERROR) {
            loopPingChecking();
        } else if (status == NO_ERROR) {
            startWebsite();
        } else {
            dlDiv.innerHTML = "Failed to check agent status due to error " + status + ".";
        }
    }
    asyncPingAgent(checking);
}

function precipitateDownload(url, check) {
    var iframe = document.getElementById("dlIFrame");
    iframe.src = url;
    if (check) {
        loopPingChecking();
    }
}

function doAgentDownload(check) {
    console.log("Retreiving path to agent...");
    if (check) {
        const jsDisp = document.getElementById("jsDisp");
        jsDisp.innerHTML = "The agent will be downloaded. Please launch it in order to be redirected to the main page.<br><br><br>"
        jsDisp.innerHTML += " <i>Note: If the agent is not detected but you are sure to have launched it, please check your anti-advertisements plugins.</i>"
    }
    const xhr = new XMLHttpRequest();
    var url = endpoint + agentDl
    xhr.open('GET', url + (/\?/.test(url) ? "&" : "?") + new Date().getTime(), true);
    xhr.onload = () => {
        var link = xhr.responseText;
        console.log("Retreived link: " + link);
        precipitateDownload(link, check);
    };
    xhr.onerror = () => {
        if (check) {
            jsDisp.innerHTML = "Failed to download the agent because an error occured in the connection.";
        } else {
            console.log("AgentDLFail: error");
        }
    };
    xhr.onabort = () => {
        if (check) {
            jsDisp.innerHTML = "Failed to download the agent because an the connection has been aborted.";
        } else {
            console.log("AgentDLFail: abort");
        }
    };
    xhr.ontimeout = () => {
        if (check) {
            jsDisp.innerHTML = "Failed to download the agent because a timeout occured.";
        } else {
            console.log("AgentDLFail: timeout");
        }
    };
    xhr.send(null);
}