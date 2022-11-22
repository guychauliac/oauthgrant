function onLoad() {
    var callbackurl = window.location.href;
    var fields = getFieldsFromCallbackURL(callbackurl);
    if (fields.error) {
        setWarning("Error: " + fields.error + ", description: " + fields.description);
    }
    if (fields.code) {
        setField("code", fields.code);
        var storedAccessTokenResponse = getCookie(fields.code);
        if (storedAccessTokenResponse) {
            processReceivedResponse(fields.code, JSON.parse(storedAccessTokenResponse));
        } else {
            getAccessTokenFromAuthorizationServer(fields.code);
        }
    }
}

function getFieldsFromCallbackURL(callbackUrl) {
    return {
        "error": getParameterByName("error", callbackUrl),
        "description": getParameterByName("error_description", callbackUrl),
        "code": getParameterByName("code", callbackUrl)
    };
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getAccessTokenFromAuthorizationServer(code) {
    var cookiePrefix = getCookie("cookie_prefix");
    fetch(getCookie(cookiePrefix + "_token_endpoint"), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=authorization_code&client_id=' + getCookie(cookiePrefix + "_clientid") + '&client_secret=' + getCookie(cookiePrefix + "_secret") + '&code=' + code + '&redirect_uri=' + getCookie(cookiePrefix + "_redirect_url")
    })
        .then(response => response.json())
        .then(response => processReceivedResponse(code, response))
}

function getBody() {
    var grant = getCookie("grant");
    if (grant == "authorizationCode") {
        return 'grant_type=authorization_code&client_id=' + getCookie(cookiePrefix + "_clientid") + '&client_secret=' + getCookie(cookiePrefix + "_secret") + '&code=' + code + '&redirect_uri=' + getCookie(cookiePrefix + "_redirect_url");
    } else if (grant == "authorizationCodePKCE") {
        return 'grant_type=authorization_code&client_id=' + getCookie(cookiePrefix + "_clientid") + '&code_verifier=' + getCookie(cookiePrefix + "_codeVerifier") + '&code=' + code + '&redirect_uri=' + getCookie(cookiePrefix + "_redirect_url");
    }
}

function setField(field, value) {
    document.getElementById(field).textContent = value;
}


function processReceivedResponse(authorizationcode, accessTokenResponse) {
    var accessTokenAsString = JSON.stringify(accessTokenResponse, null, 4);
    setField("token", accessTokenAsString);
    storeInCookie(authorizationcode, accessTokenAsString);
    showAccessTokenFields(accessTokenResponse);
    showIDTokenFields(accessTokenResponse);
}

function showAccessTokenFields(accessTokenReponse) {
    try {
        var accessToken = accessTokenReponse.access_token;
        var tokenParts = accessToken.split('.');
        var jwtHeader = parseJwt(tokenParts[0]);
        var jwtBody = parseJwt(tokenParts[1]);
        var jwtSignature = tokenParts[2];
        setField("decoded_header", beautify(jwtHeader));
        setField("decoded_body", beautify(jwtBody));
        setField("signature", jwtSignature);
        validateMatchingScopes(jwtBody);
    } catch (error) {
        setWarning("Could not show access token fields: '" + error + "'", "warning");
    }
}

function showIDTokenFields(accessTokenReponse) {
    if (accessTokenReponse.id_token) {
        try {
            var accessToken = accessTokenReponse.id_token;
            var tokenParts = accessToken.split('.');
            var jwtHeader = parseJwt(tokenParts[0]);
            var jwtBody = parseJwt(tokenParts[1]);
            var jwtSignature = tokenParts[2];
            setField("idtoken_decoded_header", beautify(jwtHeader));
            setField("idtoken_decoded_body", beautify(jwtBody));
            setField("idtoken_signature", jwtSignature);
        } catch (error) {
            setWarning("Could not show id token fields: '" + error + "'", "warning");
        }
    } else {
        setField("idtoken_decoded_header", "no id token found in respose, add 'openid' + 'email | profile' to the requesting scopes if you want to obtain an ID token");
    }
}

function validateMatchingScopes(jwtBody) {
    if (!jwtBody.scope) {
        setWarning("No scopes where authorized!", "warning");
    }

    var authorizedScopes = jwtBody.scope.split(" ");
    var cookiePrefix = getCookie("cookie_prefix");
    var requestedScopes = getCookie(cookiePrefix + "_scope").split(" ");

    var notAuthorizedScopes = requestedScopes.filter(function (scope) {
        return !authorizedScopes.includes(scope);
    });

    if (notAuthorizedScopes.length > 0) {
        setWarning("Some scopes where not authorized: " + notAuthorizedScopes, "warning");
    } else {
        setWarning("All scopes where authorized", "info");
    }
}

function storeInCookie(key, value) {
    value = value.replace(/[\n\r]+/g, '');
    const d = new Date();
    d.setTime(d.getTime() + 5 * 60 * 1000);
    document.cookie = key + "=" + value + ";domain=.guychauliac.github.io;path=/;expires=" + d.toUTCString();
}

function setWarning(message, severity) {
    setField("warning", message);
    if (severity == "warning") {
        document.getElementById("warning").className = "w3-panel w3-pale-red w3-border";
    }
    if (severity == "info") {
        document.getElementById("warning").className = "w3-panel w3-green w3-border";
    }
}

function beautify(jsonObject) {
    return JSON.stringify(jsonObject, null, 4);
}

function parseJwt(token) {
    var base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    console.log("base64 string: " + base64);
    var base64decoded = window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('');
    var jsonPayload = decodeURIComponent(base64decoded);
    return JSON.parse(jsonPayload);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}