const stopwords = [
	"eluniversocom",
	"mashirafael",
	"ecuador",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"0",
	"rt",
	"a",
	"actualmente","acuerdo","adelante","ademas","además","adrede","afirmó","agregó","ahi","ahora","ahí","al","algo","alguna","algunas","alguno","algunos","algún","alli","allí","alrededor","ambos","ampleamos","antano","antaño","ante","anterior","antes","apenas","aproximadamente","aquel","aquella","aquellas","aquello","aquellos","aqui","aquél","aquélla","aquéllas","aquéllos","aquí","arriba","arribaabajo","aseguró","asi","así","atras","aun","aunque","ayer","añadió","aún","b","bajo","bastante","bien","breve","buen","buena","buenas","bueno","buenos","c","cada","casi","cerca","cierta","ciertas","cierto","ciertos","cinco","claro","comentó","como","con","conmigo","conocer","conseguimos","conseguir","considera","consideró","consigo","consigue","consiguen","consigues","contigo","contra","cosas","creo","cual","cuales","cualquier","cuando","cuanta","cuantas","cuanto","cuantos","cuatro","cuenta","cuál","cuáles","cuándo","cuánta","cuántas","cuánto","cuántos","cómo","d","da","dado","dan","dar","de","debajo","debe","deben","debido","decir","dejó","del","delante","demasiado","demás","dentro","deprisa","desde","despacio","despues","después","detras","detrás","dia","dias","dice","dicen","dicho","dieron","diferente","diferentes","dijeron","dijo","dio","donde","dos","durante","día","días","dónde","e","ejemplo","el","ella","ellas","ello","ellos","embargo","empleais","emplean","emplear","empleas","empleo","en","encima","encuentra","enfrente","enseguida","entonces","entre","era","eramos","eran","eras","eres","es","esa","esas","ese","eso","esos","esta","estaba","estaban","estado","estados","estais","estamos","estan","estar","estará","estas","este","esto","estos","estoy","estuvo","está","están","ex","excepto","existe","existen","explicó","expresó","f","fin","final","fue","fuera","fueron","fui","fuimos","g","general","gran","grandes","gueno","h","ha","haber","habia","habla","hablan","habrá","había","habían","hace","haceis","hacemos","hacen","hacer","hacerlo","haces","hacia","haciendo","hago","han","hasta","hay","haya","he","hecho","hemos","hicieron","hizo","horas","hoy","hubo","i","igual","incluso","indicó","informo","informó","intenta","intentais","intentamos","intentan","intentar","intentas","intento","ir","j","junto","k","l","la","lado","largo","las","le","lejos","les","llegó","lleva","llevar","lo","los","luego","lugar","m","mal","manera","manifestó","mas","mayor","me","mediante","medio","mejor","mencionó","menos","menudo","mi","mia","mias","mientras","mio","mios","mis","misma","mismas","mismo","mismos","modo","momento","mucha","muchas","mucho","muchos","muy","más","mí","mía","mías","mío","míos","n","nada","nadie","ni","ninguna","ningunas","ninguno","ningunos","ningún","no","nos","nosotras","nosotros","nuestra","nuestras","nuestro","nuestros","nueva","nuevas","nuevo","nuevos","nunca","o","ocho","os","otra","otras","otro","otros","p","pais","para","parece","parte","partir","pasada","pasado","paìs","peor","pero","pesar","poca","pocas","poco","pocos","podeis","podemos","poder","podria","podriais","podriamos","podrian","podrias","podrá","podrán","podría","podrían","poner","por","porque","posible","primer","primera","primero","primeros","principalmente","pronto","propia","propias","propio","propios","proximo","próximo","próximos","pudo","pueda","puede","pueden","puedo","pues","q","qeu","que","quedó","queremos","quien","quienes","quiere","quiza","quizas","quizá","quizás","quién","quiénes","qué","r","raras","realizado","realizar","realizó","repente","respecto","s","sabe","sabeis","sabemos","saben","saber","sabes","salvo","se","sea","sean","segun","segunda","segundo","según","seis","ser","sera","será","serán","sería","señaló","si","sido","siempre","siendo","siete","sigue","siguiente","sin","sino","sobre","sois","sola","solamente","solas","solo","solos","somos","son","soy","soyos","su","supuesto","sus","suya","suyas","suyo","sé","sí","sólo","t","tal","tambien","también","tampoco","tan","tanto","tarde","te","temprano","tendrá","tendrán","teneis","tenemos","tener","tenga","tengo","tenido","tenía","tercera","ti","tiempo","tiene","tienen","toda","todas","todavia","todavía","todo","todos","total","trabaja","trabajais","trabajamos","trabajan","trabajar","trabajas","trabajo","tras","trata","través","tres","tu","tus","tuvo","tuya","tuyas","tuyo","tuyos","tú","u","ultimo","un","una","unas","uno","unos","usa","usais","usamos","usan","usar","usas","uso","usted","ustedes","v","va","vais","valor","vamos","van","varias","varios","vaya","veces","ver","verdad","verdadera","verdadero","vez","vosotras","vosotros","voy","vuestra","vuestras","vuestro","vuestros","w","x","y","ya","yo","z","él","ésa","ésas","ése","ésos","ésta","éstas","éste","éstos","última","últimas",
	"último",
	"últimos",
	"a's", //english from here
	"able","about","above","according","accordingly","across","actually","after","afterwards","again","against","ain't","all","allow","allows","almost","alone","along","already","also","although","always","am","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apart","appear","appreciate","appropriate","are","aren't","around","as","aside","ask","asking","associated","at","available","away","awfully","b","be","became","because","become","becomes","becoming","been","before","beforehand","behind","being","believe","below","beside","besides","best","better","between","beyond","both","brief","but","by","c","c'mon","c's","came","can","can't","cannot","cant","cause","causes","certain","certainly","changes","clearly","co","com","come","comes","concerning","consequently","consider","considering","contain","containing","contains","corresponding","could","couldn't","course","currently","d","definitely","described","despite","did","didn't","different","do","does","doesn't","doing","don't","done","down","downwards","during","e","each","edu","eg","eight","either","else","elsewhere","enough","entirely","especially","et","etc","even","ever","every","everybody","everyone","everything","everywhere","ex","exactly","example","except","f","far","few","fifth","first","five","followed","following","follows","for","former","formerly","forth","four","from","further","furthermore","g","get","gets","getting","given","gives","go","goes","going","gone","got","gotten","greetings","h","had","hadn't","happens","hardly","has","hasn't","have","haven't","having","he","he's","hello","help","hence","her","here","here's","hereafter","hereby","herein","hereupon","hers","herself","hi","him","himself","his","hither","hopefully","how","howbeit","however","i","i'd","i'll","i'm","i've","ie","if","ignored","immediate","in","inasmuch","inc","indeed","indicate","indicated","indicates","inner","insofar","instead","into","inward","is","isn't","it","it'd","it'll","it's","its","itself","j","just","k","keep","keeps","kept","know","known","knows","l","last","lately","later","latter","latterly","least","less","lest","let","let's","like","liked","likely","little","look","looking","looks","ltd","m","mainly","many","may","maybe","me","mean","meanwhile","merely","might","more","moreover","most","mostly","much","must","my","myself","n","name","namely","nd","near","nearly","necessary","need","needs","neither","never","nevertheless","new","next","nine","no","nobody","non","none","noone","nor","normally","not","nothing","novel","now","nowhere","o","obviously","of","off","often","oh","ok","okay","old","on","once","one","ones","only","onto","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","p","particular","particularly","per","perhaps","placed","please","plus","possible","presumably","probably","provides","q","que","quite","qv","r","rather","rd","re","really","reasonably","regarding","regardless","regards","relatively","respectively","right","s","said","same","saw","say","saying","says","second","secondly","see","seeing","seem","seemed","seeming","seems","seen","self","selves","sensible","sent","serious","seriously","seven","several","shall","she","should","shouldn't","since","six","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","soon","sorry","specified","specify","specifying","still","sub","such","sup","sure","t","t's","take","taken","tell","tends","th","than","thank","thanks","thanx","that","that's","thats","the","their","theirs","them","themselves","then","thence","there","there's","thereafter","thereby","therefore","therein","theres","thereupon","these","they","they'd","they'll","they're","they've","think","third","this","thorough","thoroughly","those","though","three","through","throughout","thru","thus","to","together","too","took","toward","towards","tried","tries","truly","try","trying","twice","two","u","un","under","unfortunately","unless","unlikely","until","unto","up","upon","us","use","used","useful","uses","using","usually","uucp","v","value","various","very","via","viz","vs","w","want","wants","was","wasn't","way","we","we'd","we'll","we're","we've","welcome","well","went","were","weren't","what","what's","whatever","when","whence","whenever","where","where's","whereafter","whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","who's","whoever","whole","whom","whose","why","will","willing","wish","with","within","without","won't","wonder","would","wouldn't","x","y","yes","yet","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves",
	"z","zero"
]

const topicos = [
	{
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

const users = {
	artistas: [
		{name: "pamela_cortesss", id: "161775175"},
		{name: "juanfervelasco", id: "56039780"}
	],
	deportes: [
		{name: "aguschmer", id: "164715111"},
		{name: "RobertoBonafont", id: "175114792"},
		{name: "BarcelonaSCweb", id: "112757144"},
		{name: "panchocevallosv", id: "355809231"},
		{name: "DiegoArcos14", id: "59714229"},
		{name: "CSEmelec", id: "15447575"},
		{name: "Gamadeportes_ec", id: "419971210"},
		{name: 'estadioec', id: '198666634'},
		{name: "MachadoRobertoO", id: "176836959"},
		{name: "Alfonso_Laso", id: "1543728618"},
		{name: "LDU_Oficial", id: "174825461"},
		{name: "marcadorec", id: "390220919"},
		{name: "FEFecuador", id: "2409683900"},
		{name: "EstebanPazR", id: "395429154"},
		{name: "IDV_EC", id: "468586302"},
		{name: "DeporteTA", id: "1601592949"},
		{name: "AVAstudillo", id: "189124591"},
		{name: "CarlosVictorM", id: "195048109"},
		{name: "CLMoralesB", id: "573808532"}
	],
	politica: [
		{name: 'tinocotania', id: '185658756'}, 
		{name: 'LassoGuillermo', id: '300390462'},
		{name: 'jaimenebotsaadi', id: '24776620'},
		{name: 'CynthiaViteri6', id: '315377387'},
		{name: 'CristinaReyesec', id: '220332032'},
		{name: 'janethinostroza', id: '197932909'},
		{name: 'ESTEFANIESPIN', id: '128937967'},
		{name: 'marcelaguinaga', id: '285137536'},
		{name: 'GabrielaEsPais', id: '271975968'},
		{name: 'RicardoPatinoEC', id: '202792190'},
		{name: 'alvaradorosana', id: '216783643'},
		{name: 'AsambleaEcuador', id: '56502954'},
		{name: 'ppsesa', id: '215996236'},
		{name: 'alfredjoe80', id: '96789803'}/*,
		{name: 'MashiRafael', id: '209780362'},
		{name: 'lenin', id: '913131817'}*/
	],
	noticieros: [
		{name: 'eluniversocom', id: '8225692'},
		{name: 'ecuadortv', id: '133184048'},
		{name: 'ecuavisa', id: '97513349'},
		{name: 'teleamazonasec', id: '95217117'},
		{name: '24HorasGYE', id: '3174317410'},
		{name: '24horasUIO', id: '3169785371'},
		{name: 'el_telegrafo', id: '51254405'},
		{name: 'EcuavisaInforma', id: '256747696'},
		{name: 'Expresoec', id: '35047698'},
		{name: 'eldiarioec', id: '35289042'},
		{name: 'elcomerciocom', id: '14333756'},
		{name: 'DiarioExtraEc', id: '175447500'},
		{name: 'PJimenezN', id: '202779862'},
		{name: 'ajungbluth', id: '183661586'},
		{name: 'Denisse_Molina', id: '244136790'},
		{name: 'RuthdelSalto', id: '203093566'},
		{name: 'MaCecilia_L', id: '202782111'},
		{name: 'fercarvo', id: '812220439'}
	]
}

function getUsers() {
	var data = []
	for (let topico in users)
		users[topico].forEach(user => data.push(user.id) );
	
	return data.join()
}

function getTopicos(){
	var data = []
	for (let topico of topicos)
		topico.data.forEach(palabra => data.push(palabra) );

	return data.join()
}

module.exports = {
	topicos: getTopicos(),
	users: getUsers(),
	stopwords
}