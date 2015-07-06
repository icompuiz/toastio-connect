var toastioConnection = require('./');

var connection = new toastioConnection('localhost', 'isioma.nnodum@gmail.com', 'isioma', '8080');

connection.connect().then(function(response) {

	console.log(connection.headers);

});