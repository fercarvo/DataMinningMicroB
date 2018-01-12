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
            resultado: null
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

        $scope.generar = function () {

            if (contador.length !== 2)
                return alert("Por favor, seleccione dos corpus a procesar")

            contador.sort((a, b) => {  
                var a = new Date(a.fecha)
                var b = new Date(b.fecha)
                return a - b
            })

            data.params.id1 = contador[0]._id
            data.params.id2 = contador[1]._id
            data.params.k = 4
            data.params.lambda = 0.6134

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
                $scope.data = res.data

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
                $scope.tweets.pop()

            $scope.tweets.unshift(tweet)
            $scope.$apply()
        })

        $scope.$on('$destroy', ()=>  socket_tweets.close())
    }])
    .controller('grafico1', ["$scope", "$state", "$http", "data", function ($scope, $state, $http, data) {

        if (!data.resultado)
            return $state.go("dias")

        waitingDialog.hide()

        $scope.topicos_1 = []
        $scope.topicos_2 = []

        var M = data.resultado.M.reverse()

        var data_mapa = []
        for (var i = 0; i < M.length; i++)
            for (var j = 0; j < M[i].length; j++)
                data_mapa.push([i, j, M[j][i] ])

        var topicos_1 = data.resultado.topicos_1.map(t => t.join(', '))
        var topicos_2 = data.resultado.topicos_2.map(t => t.join(', '))

        for (var i = 0; i < topicos_1.length; i++)
            topicos_1[i] = {data: topicos_1[i] , i}

        for (var i = 0; i < topicos_2.length; i++)
            topicos_2[i] = {data: topicos_2[i] , i}

        $scope.topicos_1 = topicos_1
        $scope.topicos_2 = topicos_2            

        var topicos = []

        for (var i = 0; i < M.length; i++)
            topicos.push(`topico ${i+1}`)

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
    .controller('grafico2', ["$scope", function($scope){

        $scope.options = {
            chart: {
                type: 'multiBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 45,
                    left: 45
                },
                clipEdge: true,
                //staggerLabels: true,
                duration: 500,
                stacked: true,
                xAxis: {
                    axisLabel: 'Topico por dia',
                    showMaxMin: false,
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    }
                },
                yAxis: {
                    axisLabel: 'Relacion topico',
                    axisLabelDistance: -20,
                    tickFormat: function(d){
                        return d3.format(',.1f')(d);
                    }
                }
            }
        };



        var data = [
            {
                key: "topico 1",
                values: [
                    {
                        key: "topico 1",
                        series: 0,
                        size: 0.1,
                        x: 0,
                        y: 1.3
                    },{
                        key: "topico 1",
                        series: 0,
                        size: 0.8,
                        x: 1,
                        y: 0.5
                    }
                ]
            },{
                key: "topico 2",
                values: [
                    {
                        key: "topico 2",
                        series: 1,
                        size: 0.9,
                        x: 0,
                        y: 0.1
                    },{
                        key: "topico 2",
                        series: 1,
                        size: 1,
                        x: 1,
                        y: 0.9
                    }
                ]
            }
        ]

        $scope.data = generateData();

        console.log($scope.data)

        /* Random Data Generator (took from nvd3.org) */
        function generateData() {
            return stream_layers(3,50+Math.random()*50,.1).map(function(data, i) {
                return {
                    key: `Topico ${i}`,
                    values: data
                };
            });
        }

        /* Inspired by Lee Byron's test data generator. */
        function stream_layers(n, m, o) {
            if (arguments.length < 3) o = 0;
            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < m; i++) {
                    var w = (i / m - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }
            return d3.range(n).map(function() {
                var a = [], i;
                for (i = 0; i < m; i++) a[i] = o + o * Math.random();
                for (i = 0; i < 5; i++) bump(a);
                return a.map(stream_index);
            });
        }

        /* Another layer generator using gamma distributions. */
        function stream_waves(n, m) {
            return d3.range(n).map(function(i) {
                return d3.range(m).map(function(j) {
                    var x = 20 * j / m - i / 3;
                    return 2 * x * Math.exp(-.5 * x);
                }).map(stream_index);
            });
        }

        function stream_index(d, i) {
            return {x: i, y: Math.max(0, d)};
        }
}])