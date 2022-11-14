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

function onLoad() {
    var grant = getCookie("grant");
    if (grant) {
        setInput("grantType", grant);
        grantSelected();
    }
}

function loadFromCookie(prefix) {
    setInput("clientid", getCookie(prefix + "_clientid"));
    setInput("secret", getCookie(prefix + "_secret"));
    setInput("redirect_url", getCookie(prefix + "_redirect_url"));
    setInput("authorize_endpoint",
        getCookie(prefix + "_authorize_endpoint"));
    setInput("token_endpoint", getCookie(prefix + "_token_endpoint"));
    setInput("audience", getCookie(prefix + "_audience"));
    setInput("scope", getCookie(prefix + "_scope"));
}

function storeInCookies(prefix) {
    var grant = getInput("grantType");
    
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    document.cookie = prefix + "_clientid=" + getInput("clientid")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = prefix + "_secret=" + getInput("secret")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = prefix + "_redirect_url="
        + getInput("redirect_url")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = prefix + "_token_endpoint="
        + getInput("token_endpoint")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = prefix + "_authorize_endpoint="
        + getInput("authorize_endpoint")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = prefix + "_audience=" + getInput("audience")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = prefix + "_scope=" + getInput("scope")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = "grant=" + getInput("grantType")
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
    document.cookie = "cookie_prefix=" + prefix
        + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();

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
    loadFromCookie(grant);

    fieldsPerGrant.all.forEach(function (field) {
        setEnabled(field, false);
    });
    fieldsPerGrant[grant].forEach(function (field) {
        setEnabled(field, true);
    });

}

function authorize() {
    var grant = getInput("grantType");
    storeInCookies(grant);

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
    window.location.href = "callback.html?code=client_credential_response";
}

function storeInCookie(key, value) {
    const d = new Date();
    d.setTime(d.getTime() + 5 * 60 * 1000);
    document.cookie = key + "=" + value + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
}

