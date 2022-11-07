const fieldsPerGrant = {
    "all": ["authorize_endpoint", "token_endpoint", "clientid", "secret", "audience", "scope", "redirect_url"],
    "authorizationCode": ["authorize_endpoint", "token_endpoint", "clientid", "secret", "audience", "scope", "redirect_url"],
    "clientCredential": ["token_endpoint", "clientid", "secret", "audience", "scope"],
};

function getInput(field) {
    return document.getElementById(field).value;
}

function setInput(field, value) {
    document.getElementById(field).value = value;
}

function setField(field, value) {
    document.getElementById(field).textContent = value;
}

function loadFromCookie() {
    setInput("clientid", getCookie("clientid"));
    setInput("secret", getCookie("secret"));
    setInput("redirect_url", getCookie("redirect_url"));
    setInput("authorize_endpoint",
        getCookie("authorize_endpoint"));
    setInput("token_endpoint", getCookie("token_endpoint"));
    setInput("audience", getCookie("audience"));
    setInput("scope", getCookie("scope"));
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return parts.pop().split(';').shift();
}

function createRequest() {
    var grant = getInput("grantType");

    if (grant == "authorizationCode") {
        var authRequest = getInput("authorize_endpoint")
            + "?response_type=code" + "&client_id="
            + getInput("clientid") + "&redirect_uri="
            + getInput("redirect_url") + "&audience="
            + getInput("audience") + "&scope="
            + getInput("scope");
        setField("authrequest", "Redirect to: " + authRequest);
        return authRequest;
    } else if (grant == "clientCredential") {
        var authRequest = 'grant_type=client_credentials' 
        + '&client_id=' + getInput("clientid") 
        + '&client_secret=' + getInput("secret")  
        + '&audience=' + getInput("audience") 
        + '&scope=' + getInput("scope") 
        setField("authrequest", "POST to:  " + getInput("token_endpoint") + " body: " + authRequest);
        return authRequest;
    }
}

function setEnabled(field, isEnabled) {
    document.getElementById(field).disabled = !isEnabled;
}

function grantSelected() {
    var grant = getInput("grantType");

    fieldsPerGrant.all.forEach(function (field) {
        setEnabled(field, false);
    });
    fieldsPerGrant[grant].forEach(function (field) {
        setEnabled(field, true);
    });

}

function authorize() {
    storeInCookies();

    var grant = getInput("grantType");
    if (grant == "authorizationCode") {
        window.location.href = createRequest();
    } else if (grant = "clientCredential") {
        callAuthorizationServer();
    }

}

function callAuthorizationServer() {
    fetch(getInput("token_endpoint"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: createRequest()
    })
        .then(response => response.json())
        .then(response => processReceivedResponse(response))
}

function processReceivedResponse(response) {
    storeInCookie("client_credential_response", JSON.stringify(response))
    window.location.href = "/oauth/callback.html?code=client_credential_response";
}

function storeInCookie(key, value) {
    const d = new Date();
    d.setTime(d.getTime() + 5 * 60 * 1000);
    document.cookie = key + "=" + value + ";domain=.maxxq.org;path=/;expires=" + d.toUTCString();
}

function storeInCookies() {
    document.cookie = "clientid=" + getInput("clientid")
        + ";domain=.maxxq.org;path=/";
    document.cookie = "secret=" + getInput("secret")
        + ";domain=.maxxq.org;path=/";
    document.cookie = "redirect_url="
        + getInput("redirect_url")
        + ";domain=.maxxq.org;path=/";
    document.cookie = "token_endpoint="
        + getInput("token_endpoint")
        + ";domain=.maxxq.org;path=/";
    document.cookie = "authorize_endpoint="
        + getInput("authorize_endpoint")
        + ";domain=.maxxq.org;path=/";
    document.cookie = "audience=" + getInput("audience")
        + ";domain=.maxxq.org;path=/";
    document.cookie = "scope=" + getInput("scope")
        + ";domain=.maxxq.org;path=/";
}