var api_url='http://localhost:9081'

function convertObject(node, node_size, height){
  var img_href="images/png/multiply-1.png"
  switch (node.type) {
    case 'users':
      img_href="images/png/users.png"
      break;
	case 'firewall':
      img_href="images/png/lock.png"
      break;
    case 'proxy':
      img_href="images/png/shuffle-1.png"
      break;
    case 'worker':
      img_href="images/png/settings.png"
      break;
    case 'database':
      img_href="images/png/database-1.png"
      break;
    case 'cloud':
      img_href="images/png/cloud-computing-1.png"
      break;
	default:
       img_href="images/png/multiply-1.png";
    }
	if(node.rootobject) {
		return { id: node.name, label: node.label, fx: node_size*2, fy: (height)/2, img: img_href };
	}
	else {
		return { id: node.name, label: node.label, img: img_href };
	}
}

function convertLink(link, fixedSourceName) {
	if(link.source == fixedSourceName) {
	  return { target: link.destination, source: link.source, strength: 1 };
	}
	return  { target: link.destination, source: link.source, strength: 0.1 };
}

angular.module('link', ['ngRoute', 'ngSanitize'])
.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller:'mainViewController',
      templateUrl:'main.html',
    })
    .when('/graph/:projectId', {
      controller:'projetViewController',
      templateUrl:'graph.html',
    })
	.when('/param', {
      controller:'ParamListController',
      templateUrl:'param.html',
		
	})
	.when('/:tag', {
      controller:'LinkListController',
      templateUrl:'list.html',
	})
    .otherwise({
      redirectTo:'/'
	});
})
.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $httpProvider.defaults.headers.get['Accept-Charset'] = undefined;
}])
.filter('trust', [
    '$sce',
    function($sce) {
      return function(value, type) {
        // Defaults to treating trusted text as `html`
        return $sce.trustAs(type || 'html', value);
      }
    }
])
.controller('ParamListController', ['$scope', '$window', function($scope, $window) {
}])

.controller('mainViewController', ['$scope','$http', '$routeParams', '$sanitize', '$filter', '$window', function($scope, $http, $routeParams, $sanitize, $filter, $window) {
	console.log("mainViewController");
	
	$http.get(api_url + '/projects').then(function(response) {
		$scope.projects=response.data;	
		$scope.tags=[];
		$scope.nbTot=$scope.projects.length;
		console.log($scope.nbTot);
		for(i=0; i < $scope.nbTot; i++) {
			console.log($scope.projects[i]);
			for(j=0; j < $scope.projects[i].tags.length; j++) {
				$scope.tags.push({name:$scope.projects[i].tags[j]});
			}
		}
		console.log($scope.tags);
	});
	
	if(typeof $routeParams.tag !== 'undefined') {
		$scope.searchText = $routeParams.tag;
	} else {
		$scope.pasDeTag = 'active';
	}
	
	$scope.clearSearchText = function() {
	 $scope.searchText = "";
	 $scope.pasDeTag = 'active';
	}
	$scope.updateSearchText = function(new_text) {
	 $scope.searchText = new_text;
	 $scope.pasDeTag = 'inactive';
	}
	$scope.submitSearch = function() {
	 var result = $filter('filter')($scope.links, $scope.searchText);
	 if(result.length == 1) {
	  console.log(result);
	  $window.open('#!/graph/' + result[0].id);
	 }
	}
	$("input[name='search']").focus();
}])

.controller('projetViewController', ['$scope','$http', '$routeParams', '$sanitize', '$filter', '$window', function($scope, $http, $routeParams, $sanitize, $filter, $window) {
	console.log("projetViewController");
	
	var width = $( window ).width()/1.5;
	$scope.width=width;
	var height = $( window ).height()/1.5;
	$scope.height=height;
	
	$http.get(api_url + '/projects?projectid=eq.' + $routeParams.projectId).then(function(response) {
		$scope.project=response.data[0];
		$scope.searchText = $scope.project.name;
		
		$http.get(api_url + '/components_links?projectid=eq.' + $routeParams.projectId).then(function(responseLink) {
			var node_size=Math.min(50,width/(responseLink.data.length*2));
			console.log("DEBUG node_size="+node_size);
			$http.get(api_url + '/components?projectid=eq.' + $routeParams.projectId).then(function(responseNode) {
				$scope.nodes = [];
				for(i=0; i < responseNode.data.length; i++) {
					node=convertObject(responseNode.data[i], node_size, height);
					$scope.nodes.push(node);
				}
			
				$scope.links = [];
				for(i=0; i < responseLink.data.length; i++) {
					link=convertLink(responseLink.data[i]);
					$scope.links.push(link);
				}
				console.log($scope.links);

	$scope.getNeighbors = function (node) {
	  return $scope.links.reduce(function (neighbors, link) {
		  if (link.target.id === node.id) {
			neighbors.push(link.source.id)
		  } else if (link.source.id === node.id) {
			neighbors.push(link.target.id)
		  }
		  return neighbors
		},
		[node.id]
	  )
	}

	var svg = d3.select('svg')
	svg.attr('width', width).attr('height', height)

	var zoom = d3.zoom()
		.scaleExtent([1, 40])
		.translateExtent([[-100, -100], [width + 90, height + 100]])
		.on("zoom", zoomed);
		
	// simulation setup with all forces
	var linkForce = d3
	  .forceLink()
	  .id(function (link) { return link.id })
	  .strength(function (link) { return link.strength })
	//  .size([width, height]);

	var simulation = d3
	  .forceSimulation()
	  .force('link', linkForce)
	  .force('charge', d3.forceManyBody().strength(-1*node_size*10))
	  .force('center', d3.forceCenter(width / 2, height / 2))

	var dragDrop = d3.drag().on('start', function (node) {
	  node.fx = node.x
	  node.fy = node.y
	  console.log(node);
	}).on('drag', function (node) {
	  simulation.alphaTarget(0.7).restart()
	  node.fx = d3.event.x
	  node.fy = d3.event.y
	}).on('end', function (node) {
	  if (!d3.event.active) {
		simulation.alphaTarget(0)
	  }
	  node.fx = null
	  node.fy = null
	})

	$scope.selectNode = function (selectedNode) {
	  console.log(selectedNode.label);
	  $scope.$apply(function () {
		$scope.selectedNode = selectedNode;
	  });
	}

	// diffing and mutating the data
	function updateData(selectedNode) {
	  var neighbors = getNeighbors(selectedNode)
	  var newNodes = baseNodes.filter(function (node) {
		return neighbors.indexOf(node.id) > -1 || node.level === 1
	  })

	  var diff = {
		removed: $scope.nodes.filter(function (node) { return newNodes.indexOf(node) === -1 }),
		added: newNodes.filter(function (node) { return nodes.indexOf(node) === -1 })
	  }

	  diff.removed.forEach(function (node) { $scope.nodes.splice(nodes.indexOf(node), 1) })
	  diff.added.forEach(function (node) { $scope.nodes.push(node) })

	  links = baseLinks.filter(function (link) {
		return link.target.id === selectedNode.id || link.source.id === selectedNode.id
	  })
	}

	// we use svg groups to logically group the elements together

	var view = svg.append("rect")
		.attr("class", "view")
		.attr("x", 0.5)
		.attr("y", 0.5)
		.attr("width", width - 1)
		.attr("height", height - 1)
		.attr("class", "view");

	//add encompassing group for the zoom 
	var g = svg.append("g")
		.attr("class", "everything");
	var linkGroup = g.append('g').attr('class', 'links');
	var nodeGroup = g.append('g').attr('class', 'nodes');
	var textGroup = g.append('g').attr('class', 'texts');
	
	function zoomed() {
		g.attr("transform", d3.event.transform)
	}

	function updateGraph() {
	  // links
	  linkElements = linkGroup.selectAll('line')
		.data($scope.links, function (link) {
		  return link.target.id + link.source.id
		})

	  linkElements.exit().remove() 

	  var linkEnter = linkElements
		.enter().append('line')
		.attr('stroke-width', 1)
		.attr('stroke', 'rgba(50, 50, 50, 0.2)')

	  linkElements = linkEnter.merge(linkElements)

	  // nodes
	  nodeElements = nodeGroup.selectAll('circle')
		.data($scope.nodes, function (node) { return node.id })

	  nodeElements.exit().remove()

	  var nodeEnter = nodeElements
		.enter()
		.append('svg:image')
		.attr("xlink:href", function (node) { return node.img })
		.attr('width', node_size)
		.attr('height', node_size)
		.attr('fill', function (node) { return node.level === 1 ? 'red' : 'gray' })
		//.call(dragDrop)
		// we link the selectNode method here
		// to update the graph on every click
		.on('click', $scope.selectNode)

	  nodeElements = nodeEnter.merge(nodeElements)

	  // texts
	  textElements = textGroup.selectAll('text')
		.data($scope.nodes, function (node) { return node.id })

	  textElements.exit().remove()

	  var textEnter = textElements
		.enter()
		.append('text')
		.text(function (node) { return node.label })
		.attr('font-size', 15)
		.attr('dx', 15)
		.attr('dy', 4)

	  textElements = textEnter.merge(textElements)
	}

	$scope.updateSimulation = function () {
	  updateGraph()

	  simulation.nodes($scope.nodes).on('tick', () => {
		nodeElements
		  .attr('x', function (node) { return Math.min(node.x - (node_size/2), width- (node_size/2)) })
		  .attr('fx', function (node) { return node.fx })
		  .attr('fy', function (node) { return node.fy })
		  .attr('y', function (node) { return Math.min(node.y - (node_size/2),height  - (node_size)-20) })
		  
		textElements
		  .attr('x', function (node) { return node.x - (node_size) })
		  .attr('y', function (node) { return Math.min(node.y + (node_size/2)+10, height-10) })
		linkElements
		  .attr('x1', function (link) { return link.source.x })
		  .attr('y1', function (link) { return link.source.y })
		  .attr('x2', function (link) { return link.target.x })
		  .attr('y2', function (link) { return link.target.y })
	  })

	  simulation.force('link').links($scope.links)
	  simulation.alphaTarget(0.7).restart()
	}

	// last but not least, we call updateSimulation
	// to trigger the initial render
	$scope.updateSimulation()
	svg.call(zoom); 
	});});});
}]);

