const fieldsPerGrant = {
    "all": ["authorize_endpoint_fg", "token_endpoint_fg", "clientid_fg", "secret_fg", "audience_fg", "scope_fg", "redirect_url_fg", "code_verifier_fg", "code_challenge_fg"],
    "authorizationCode": ["authorize_endpoint_fg", "token_endpoint_fg", "clientid_fg", "secret_fg", "audience_fg", "scope_fg", "redirect_url_fg"],
    "authorizationCodePKCE": ["authorize_endpoint_fg", "token_endpoint_fg", "clientid_fg", "secret_fg", "code_verifier_fg", "code_challenge_fg", "audience_fg", "scope_fg", "redirect_url_fg"],
    "clientCredential": ["token_endpoint_fg", "clientid_fg", "secret_fg", "audience_fg", "scope_fg"],
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

    const oneYear = new Date();
    oneYear.setTime(oneYear.getTime() + 365 * 24 * 60 * 60 * 1000);

    const oneMinute = new Date();
    oneYear.setTime(oneYear.getTime() + 60 * 1000);

    document.cookie = prefix + "_clientid=" + getInput("clientid")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = prefix + "_secret=" + getInput("secret")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = prefix + "_redirect_url="
        + getInput("redirect_url")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = prefix + "_token_endpoint="
        + getInput("token_endpoint")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = prefix + "_authorize_endpoint="
        + getInput("authorize_endpoint")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = prefix + "_audience=" + getInput("audience")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = prefix + "_scope=" + getInput("scope")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = "grant=" + getInput("grantType")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = "code_verifier=" + getInput("code_verifier")
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
    document.cookie = "cookie_prefix=" + prefix
        + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();

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
        setField("console", "Redirect to: " + authRequest);
        return authRequest;
    } else if (grant == "authorizationCodePKCE") {
        var authRequest = getInput("authorize_endpoint")
            + "?response_type=code" + "&client_id="
            + getInput("clientid") + "&redirect_uri="
            + getInput("redirect_url") + "&audience="
            + getInput("audience") + "&scope="
            + getInput("scope") + "&code_challenge="
            + getInput("code_challenge") + "&code_challenge_method=S256"
        setField("console", "Redirect to: " + authRequest);
        return authRequest;
    } else if (grant == "clientCredential") {
        var authRequest = 'grant_type=client_credentials'
            + '&client_id=' + getInput("clientid")
            + '&client_secret=' + getInput("secret")
            + '&audience=' + getInput("audience")
            + '&scope=' + getInput("scope")
        setField("console", "POST to:  " + getInput("token_endpoint") + " body: " + authRequest);
        return authRequest;
    }
}

function setEnabled(field, isEnabled) {
    //document.getElementById(field).disabled = !isEnabled;
    var element = document.getElementById(field)
    if(element){
    	element.style.display = isEnabled ? "block" : "none";
	}
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

    generateCodeChallengeAndVerifier();
}

function generateCodeChallengeAndVerifier() {
    var verifier = generateCodeVerifier();
    setInput("code_verifier", verifier);
    setInput("code_challenge", generateCodeChallenge(verifier));
}

function authorize() {
    var grant = getInput("grantType");
    storeInCookies(grant);

    if (grant == "authorizationCode" || grant =="authorizationCodePKCE") {
        redirect(createRequest());
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
        .catch(error => setField("console", "Error occured during invocation of token endpoint on the authorization server: " + error))
}

function redirect(toURL) {
    window.location.href = toURL;
}

function processReceivedResponse(response) {
    storeInCookie("client_credential_response", JSON.stringify(response))
    window.location.href = "callback.html?code=client_credential_response";
}

function storeInCookie(key, value) {
    const oneYear = new Date();
    oneYear.setTime(oneYear.getTime() + 5 * 60 * 1000);
    document.cookie = key + "=" + value + ";domain=.oauth.maxxq.org;path=/;expires=" + oneYear.toUTCString();
}

