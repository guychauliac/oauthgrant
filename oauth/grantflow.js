const fieldsPerGrant = {
    "all": ["authorize_endpoint", "token_endpoint", "clientid", "secret", "audience", "scope", "redirect_url"],
    "authorizationCode": ["authorize_endpoint", "token_endpoint", "clientid", "secret", "audience", "scope", "redirect_url"],
    "clientCredential": ["authorize_endpoint", "token_endpoint", "clientid", "secret", "audience", "scope"],
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

function storeInCookie() {
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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return parts.pop().split(';').shift();
}

function createRequest(){
    var authRequest = getInput("authorize_endpoint")
        + "?response_type=code" + "&client_id="
        + getInput("clientid") + "&redirect_uri="
        + getInput("redirect_url") + "&audience="
        + getInput("audience") + "&scope="
        + getInput("scope");
    setField("authrequest", authRequest);
    return authRequest;
}

function setEnabled(field, isEnabled){
    document.getElementById(field).disabled = !isEnabled;
}

function grantSelected(){
    var grant = getInput("grantType");

    fieldsPerGrant.all.forEach(function(field){
        setEnabled(field, false);
    }); 
    fieldsPerGrant[grant].forEach(function(field){
        setEnabled(field, true);
    }); 

}

function authorize() {
    storeInCookie();
    
    window.location.href = createRequest();
}