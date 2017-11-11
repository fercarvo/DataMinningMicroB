process.on('message', function (data) {

	var sum = 1
	var cantidad = 100000
	for (var i = 0; i < cantidad; i++) {
		sum+=1
		console.log(sum + data)
	}

	process.send(sum)
})