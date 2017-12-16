var topicos = [
	/*{
		nombre: "temblores",
		data: [
			"temblor", 
			"terremoto", 
			"sismo", 
			"movimiento telurico", 
			"magnitud", 
			"instituto geofisico"
		]
	},*/{
		nombre: "corrupcion",
		data: [
			//"peculado", 
			"jorge glas", 
			//"odebrech", 
			//"corrupcion", 
			"ricardo rivera", 
			"capaya",
			//"juicio politico",
			//"concusion",
			//"lavado de dinero",
			//"panama papers",
			//"paraisos fiscales"
		]
	},{
		nombre: "LeninMoreno",
		data: [
			//"Lenin moreno", 
			//"Correa", 
			//"rafael correa", 
			"alianza pais", 
			//"patiño",
		]
	}
]

var users = [
	{
		name: "fercarvo",
		id: "812220439"
	},{
		name: "eluniversocom",
		id: "8225692"
	},{
		name: "ecuadortv",
		id: "133184048"
	},{
		name: "mashirafael",
		id: "209780362"
	}, {
		name: "lenin",
		id: "913131817"
	}, {
		name: "lassoguillermo",
		id: "300390462"
	}, {
		name: "ecuavisa",
		id: "97513349"
	}, {
		name: "teleamazonasec",
		id: "95217117"
	}
]

function getUsers(){
	var string = users[0].id

	for (var i = 1; i < users.length; i++) {
		string = `${string}, ${users[i].id}`
	}

	return string
}

function getTopicos(){
	var string = "ecuador"

	for (topico of topicos) {
		for (palabra of topico.data) {
			string += `, ${palabra}`
		}
	}

	return string
}

module.exports = {
	topicos: getTopicos,
	users: getUsers
}