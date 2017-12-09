var pi = 3.141593

function longProcess () {
	for (var i = 0; i < 3000; i++) {
		console.log(i)	
	}
	console.log("termino")
}
//export pi
function sum (x, y) {
	return x + y
}

export = {
	pi, 
	longProcess, 
	sum
}

