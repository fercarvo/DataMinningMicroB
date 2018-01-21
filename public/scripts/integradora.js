var socket = io.connect('http://localhost:3001', {'forceNew':true })

socket.on("jpp", res => {
    var event = new CustomEvent(res.peticion, {detail: res})
    document.dispatchEvent(event)
})

socket.on("disconnect", ()=> {
    document.dispatchEvent(new Event("disconnect"))
})


//Key, es el id de suscripcion
//data, información a enviador
function requestJPP (peticion, data) {
    return new Promise((resolve, reject)=> {

        if (socket.disconnected)
            return reject("Server disconnected")

        function response (e) {     
            var res = e.detail
            if (res.error)
                return reject(res.error)
            document.removeEventListener(peticion, response)
            document.removeEventListener("disconnect", disconnect)
            resolve(res)
        }

        function disconnect () {
            document.removeEventListener(peticion, response)
            document.removeEventListener("disconnect", disconnect)
            reject("Server disconnected")
        }

        socket.emit("jpp", {peticion, data})
        document.addEventListener(peticion, response, false)
        document.addEventListener("disconnect", disconnect, false)
    })
}

angular.module('app', ['ui.router', 'nvd3'])
    .config(["$stateProvider", "$compileProvider", function ($stateProvider, $compileProvider) {
        $stateProvider
            .state('home', {
                templateUrl: 'views/home.html',
                controller: 'home'
            })
            .state('dias', {
                templateUrl: 'views/dias.html',
                controller: 'dias'
            })
            .state('grafico1', {
                templateUrl: 'views/grafico.html',
                controller: 'grafico1'
            })
            .state('listener', {
                templateUrl: 'views/stream.html',
                controller: 'listener'
            })
            .state('grafico2', {
                templateUrl: "views/grafico2.html",
                controller: "grafico2"
            })
        
    }])
    .run(["$state", "$http", "$templateCache", function ($state, $http, $templateCache) {

        loadTemplates($state, "dias", $http, $templateCache)

    }])
    .factory("data", [function(){

        var data = {
            params: {
                id1: null,
                id2: null,
                k: null,
                lambda: null
            },
            resultado: null,
            grafico2: {}
        }

        return data

    }])
    .controller("home", [function () {

    }])
    .controller('dias', ["$scope", "$state", "$http", "data", function($scope, $state, $http, data){

        data.resultado = null
        var peticion = ""
        var contador = []
        $scope.disable = null
        $scope.check = null
        $scope.k = 6
        $scope.lambda = 0.001



        $scope.calculo = function (corpus) {

            if (contador.length < 2) {
                contador.push(corpus)
                corpus.check = true
            }

            if (contador.filter(c => c._id === corpus._id).length > 1)
                contador = []        

            if (contador.length == 2 && contador[0]._id != contador[1]._id)
                $scope.disable = true
        }

        $scope.cancelar = function () {
            $scope.disable = null

            contador = []

            $scope.data.forEach(corpus => {
                corpus.check = false
            })

            peticion = ""
        }

        $scope.generar = function (k, lambda) {

            if (contador.length !== 2)
                return alert("Por favor, seleccione dos corpus a procesar")

            contador.sort((a, b) => {  
                var a = new Date(a.fecha)
                var b = new Date(b.fecha)
                return a - b
            })

            data.params.id1 = contador[0]._id
            data.params.id2 = contador[1]._id
            data.params.k = k
            data.params.lambda = lambda

            console.log(`\nCp1 ${contador[0].fecha}`)
            console.log(`Cp2 ${contador[1].fecha}`)

            peticion = `${data.params.id1}/${data.params.id2}/${data.params.k}/${data.params.lambda}`

            waitingDialog.show('Procesando corpus, por favor espere');

            requestJPP(peticion, data.params)
                .then(res => {
                    data.resultado = res.data

                    if (!res.data.M)
                        return alert("No se ha obtenido la informacion correcta"), waitingDialog.hide()

                    $state.go("grafico1")
                    waitingDialog.hide()

                })
                .catch(e => {
                    waitingDialog.hide()
                    alert(`Error: ${e}`)
                })               
        }

        $http.get("/corpus", { cache: true})
            .then(res => {
                $scope.data = res.data.filter(c => c.compressed)

                $scope.data.forEach(corpus => {
                    corpus.check = false
                })
            })
            .catch(e=> console.log(e))

    }])
    .controller('listener', ["$scope", "$state", function($scope, $state){

        var socket_tweets = io.connect('http://localhost:3002', {'forceNew':true }) //tweets

        $scope.tweets = []

        socket_tweets.on('tweet', function (tweet) {

            if ($scope.tweets.length >= 25)
                $scope.tweets.pop();

            $scope.tweets = [tweet, ...$scope.tweets]
            $scope.$apply()
        })

        $scope.$on('$destroy', ()=>  socket_tweets.close())
    }])
    .controller('grafico1', ["$scope", "$state", "$http", "data", function ($scope, $state, $http, data) {

        $scope.k = data.params.k
        $scope.lambda = data.params.lambda

        var M_copy = [...data.resultado.M]

        $scope.obtenerFila = function(fila){
            console.log('fila: ', M_copy[fila])
            data.grafico2 = {
                nombre: `Topico ${fila + 1} dia 2 con tópicos del día 1`,
                data: M_copy[fila]
            }
            $state.go('grafico2')
        }
        $scope.obtenerColumna= function(columna){
            var valores = []
            for (var i = 0; i < M_copy.length;  i++) {
                valores.push(M_copy[i][columna])
            }
           data.grafico2 = {
                nombre: `Topico ${columna + 1} dia 1 con tópicos del día 2`,
                data: valores
            }
            $state.go('grafico2')
            console.log('columna: ', valores)
        }



        if (!data.resultado)
            return $state.go("dias")

        waitingDialog.hide()

        $scope.topicos_1 = []
        $scope.topicos_2 = []



        var M = data.resultado.M.reverse()

        

        var data_mapa = []
        for (var i = 0; i < M.length; i++)
            for (var j = 0; j < M[i].length; j++)
                data_mapa.push([i, j, Math.round( M[j][i] * 100000)/100000 ])

        var topicos_1 = data.resultado.topicos_1//.map(t => t.join(' - '))
        var topicos_2 = data.resultado.topicos_2//.map(t => t.join(' ~ '))

        /*for (var i = 0; i < topicos_1.length; i++)
            topicos_1[i] = {data: topicos_1[i] , i}

        for (var i = 0; i < topicos_2.length; i++)
            topicos_2[i] = {data: topicos_2[i] , i}*/

        $scope.topicos_1 = topicos_1
        $scope.topicos_2 = topicos_2            

        var topicos = []

        for (var i = 0; i < M.length; i++)
            topicos.push(`TP ${i+1}`)

        var topicosY = topicos.slice()

        Highcharts.chart('container', {

            chart: {
                type: 'heatmap',
                marginTop: 40,
                marginBottom: 80,
                plotBorderWidth: 1
            },

            title: {
                text: 'Mapa de calor de la matriz M por periodos'
            },

            xAxis: {
                categories: topicos//['topico1', 'topico2', 'topico3', 'topico4', 'topico5']
            },

            yAxis: {
                categories: topicosY.reverse(),
                title: null
            },

            colorAxis: {
                min: 0,
                minColor: '#FFFFFF',
                maxColor: Highcharts.getOptions().colors[0]
            },

            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },

            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> del periodo 1, se relaciona en <br><b>' + this.point.value + '</b>  con <b>' + this.series.yAxis.categories[this.point.y] + '</b> del periodo 2';
                }
            },

            series: [{
                name: 'Sales per employee',
                borderWidth: 1,
                data: data_mapa,
                dataLabels: {
                    enabled: true,
                    color: '#000000'
                }
            }]

        })
    }])
    .controller('grafico2', ["$scope",  "data",  function($scope, data){

            $scope.leyenda = data.grafico2.nombre

            console.log(data.grafico2)
            $scope.options = {
                    chart: {
                        type: 'discreteBarChart',
                        height: 450,
                        margin : {
                            top: 20,
                            right: 20,
                            bottom: 50,
                            left: 55
                        },
                        x: function(d){return d.label;},
                        y: function(d){return d.value;},
                        showValues: true,
                        valueFormat: function(d){
                            return d3.format(',.4f')(d);
                        },
                        duration: 500,
                        xAxis: {
                            axisLabel: 'Topicos'
                        },
                        yAxis: {
                            axisLabel: 'Relación',
                            axisLabelDistance: -10
                        }
                    }
                };

                $scope.data = [
                    {
                        key: data.grafico2.nombre,
                        values: []
                    }
                ]

                for (var i = 0; i <  data.grafico2.data.length; i++) {
                    $scope.data[0].values.push({
                        'label':  `TP ${i+1}`,
                        'value': data.grafico2.data[i]
                    })
                }
       
    }])