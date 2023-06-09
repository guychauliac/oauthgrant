let loadedFileData = null;

function loadFile() {
  let file = fileInput.files[0];
  let reader = new FileReader();

  reader.onload = function(e) {
    loadedFileData = e.target.result;
    console.log('File loaded:', loadedFileData);
    showData(JSON.parse(loadedFileData));
  };

  reader.readAsText(file);
}

function saveFile() {
    let fileName = prompt('Enter a file name');
    if (fileName) {
      let blob = new Blob([JSON.stringify(getData())], { type: 'text/plain' });
      let url = URL.createObjectURL(blob);

      let a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();

      URL.revokeObjectURL(url);
    }
}

function getData(){
	return {
		"grant_type" : getInput("grantType"),
		"authorize_endpoint" : getInput("authorize_endpoint"),
		"token_endpoint" : getInput("token_endpoint"),
		"clientid" : getInput("clientid"),
		"secret" : getInput("secret"),
		"redirect_url" : getInput("redirect_url"),
		"audience" : getInput("audience"),
		"scope" : getInput("scope")
	};
}

function showData(json){
	 setInput("grantType", json.grant_type);
	 grantSelected();
	 setInput("authorize_endpoint", json.authorize_endpoint);
	 setInput("token_endpoint", json.token_endpoint);
	 setInput("clientid", json.clientid);
	 setInput("secret", json.secret);
	 setInput("redirect_url", json.redirect_url);
	 setInput("audience", json.audience);
	 setInput("scope", json.scope);
}
