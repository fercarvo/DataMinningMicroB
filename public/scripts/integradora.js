var socket = io.connect('http://localhost:3001', {'forceNew':true })

socket.on("jpp", res => {
    var event = new CustomEvent(res.peticion, {detail: res})
    document.dispatchEvent(event)
})

socket.on("disconnect", ()=> {
    document.dispatchEvent(new Event("disconnect"))
})


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
            .state('grafico', {
                templateUrl: 'views/grafico.html',
                controller: 'grafico'
            })
            .state('grafico.matrix', {
                templateUrl: 'views/grafico.matrix.html',
                controller: 'grafico.matrix'
            })
            .state('grafico.barras', {
                templateUrl: 'views/grafico.barras.html',
                controller: 'grafico.barras'
            })
            .state('listener', {
                templateUrl: 'views/stream.html',
                controller: 'listener'
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
    .controller('dias', ["$scope", "$state", "$http", "data", function($scope, $state, $http, data){
        data.resultado = null
        var peticion = ""
        var contador = []
        $scope.disable = null
        $scope.check = null
        $scope.k = 5
        $scope.lambda = 0.001

        $scope.calculo = function (corpus) {
            if (contador.length < 2) {
                contador.push(corpus)
                corpus.check = true
            }

            if (contador.filter(c => c._id === corpus._id).length > 1)
                contador = [];        

            if (contador.length == 2 && contador[0]._id != contador[1]._id)
                $scope.disable = true;
        }

        $scope.cancelar = function () {
            $scope.disable = null
            contador = []
            $scope.data.forEach(corpus => {
                corpus.check = false
            })
            peticion = ""
        }

        $scope.generar = async function (k, lambda) {
            if (contador.length !== 2)
                return alert("Por favor, seleccione dos corpus a procesar");

            contador.sort((a, b) => new Date(a.fecha)- new Date(b.fecha))

            data.params.id1 = contador[0]._id
            data.params.id2 = contador[1]._id
            data.params.k = k
            data.params.lambda = lambda

            console.log(`\nCp1 ${contador[0].fecha}`)
            console.log(`Cp2 ${contador[1].fecha}`)

            peticion = `${data.params.id1}/${data.params.id2}/${data.params.k}/${data.params.lambda}`;
            waitingDialog.show('Procesando corpus, por favor espere');

            try {
                var res = await requestJPP(peticion, data.params);
                data.resultado = res.data;
                if (res.data.M)
                    return $state.go("grafico");
                alert("No se ha obtenido la informacion correcta")
                
            } catch (e) { alert(`Error: ${e}`) }
            finally { waitingDialog.hide() }             
        }

        $http.get("/corpus", { cache: true})
            .then(res => {
                $scope.data = res.data.filter(c => c.compressed);
                $scope.data.forEach(corpus => {
                    corpus.check = false
                })
            })
            .catch(e=> console.log(e))
    }])
    .controller('listener', ["$scope", "$state", function($scope, $state){
        var socket_tweets = io.connect('http://localhost:3002', {'forceNew':true }); //tweets
        $scope.tweets = [];
        socket_tweets.on('tweet', function (tweet) {
            if ($scope.tweets.length >= 25)
                $scope.tweets.pop();
            $scope.tweets = [tweet, ...$scope.tweets];
            $scope.$apply()
        })
        $scope.$on('$destroy', ()=>  socket_tweets.close())
    }])
    .controller('grafico', ["$scope", "$state", "data", '$rootScope', function ($scope, $state, data, $rootScope) {
        waitingDialog.hide()
        $state.go('grafico.matrix')
        var M = [...data.resultado.M]
        $scope.topicos_1 = data.resultado.topicos_1;
        $scope.topicos_2 = data.resultado.topicos_2; 

        $scope.obtenerFila = function(fila){
            data.grafico2 = {
                nombre: `EL tópico ${fila + 1} del día 2 se derivó de:`,
                data: M[fila]
            }
            $state.go('grafico.barras')
            if ($state.includes('grafico.barras'))
                $state.reload('grafico.barras')
        }

        $scope.obtenerColumna= function(index){
            var columna = M.reduce((col, fila)=> [...col, fila[index]] , [])
            data.grafico2 = {
                nombre: `El tópico ${index + 1} del día 1 derivó en:`,
                data: columna
            }
            $state.go('grafico.barras')
            if ($state.includes('grafico.barras'))
                $state.reload('grafico.barras')
        }
    }])
    .controller('grafico.matrix', ["$scope", "$state", "data", function ($scope, $state, data){

        if (!data.resultado)
            return $state.go("dias")

        var M = [...data.resultado.M].reverse();
        var data_mapa = [];
        for (var i = 0; i < M.length; i++)
            for (var j = 0; j < M[i].length; j++)
                data_mapa.push([i, j, Math.round( M[j][i] * 100000)/100000 ])          
        
        var topicosX = M.map((fila, i)=> `TP ${i+1}`);
        var topicosY = [...topicosX].reverse()

        Highcharts.chart('container', {
            chart: {
                type: 'heatmap',
                marginTop: 40,
                marginBottom: 45,
                plotBorderWidth: 1
            },
            title: {
                text: 'Mapa de calor de la matriz M por periodos'
            },
            xAxis: { categories: topicosX },
            yAxis: { categories: topicosY },
            colorAxis: {
                min: 0,
                max: 1,
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
                    return `<b> ${this.series.xAxis.categories[this.point.x]} </b> del periodo 1, se relaciona en <br><b> ${this.point.value} </b> con <b> ${this.series.yAxis.categories[this.point.y]} </b> del periodo 2`;
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
    .controller('grafico.barras', ["$scope", "$state", "data", function ($scope, $state, data){
        $scope.leyenda = data.grafico2.nombre
        $scope.matrix = function() { $state.go('grafico.matrix') }
        $scope.$on('change-grafico', function() { $state.reload(), console.log('reloading...') })

        $scope.options = {
            chart: {
                //yDomain: [0, 1.1],
                type: 'discreteBarChart',
                height: 380,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 55
                },
                x: d => d.label,
                y: d => d.value,
                showValues: true,
                valueFormat: d => d3.format(',.4f')(d),
                duration: 500,
                xAxis: {
                    axisLabel: 'Topicos relacionados'
                },
                yAxis: {
                    axisLabel: 'Grado de relación',
                    axisLabelDistance: -10
                }
            }
        };

        $scope.data = [{
            key: data.grafico2.nombre,
            values: []
        }]

        data.grafico2.data.map(val => (val > 0.5) ? val: 0).forEach((value, i) => {
            $scope.data[0].values.push({label: `TP ${i+1}`, value})
        })

        if (data.grafico2.data.every(val => val <= 1))
            $scope.options.chart.yDomain = [0,1]
        else
            $scope.options.chart.yDomain = [0,1.1]

    }])
    .controller("home", [function () {

    }])


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