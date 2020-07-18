const username = 'USERNAME';
const password = 'PASSWORD';
const clusterUrl = 'URL'

exports.url = "mongodb+srv://" + username + ":" + password + "@" + clusterUrl +"test?retryWrites=true&w=majority" ;
