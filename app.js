var tst_data_set=[{data:[]},{data:[]}];
var size_ratio=2;
var container, stats;
var camera, scene, raycaster, renderer;
var objectLoader = new THREE.ObjectLoader();
var loader = new THREE.FontLoader();

var mouse = new THREE.Vector2(), prev_INTERSECTED, INTERSECTED;
mouse.x=1;
mouse.y=1;
var prev_mouse;
var radius = 100, theta = 0;
var prev_id=0,id=0;
var moving=0;


var setupObj;
var scene_obj=[];
var obj_list=[];
var first_time=1;
var font;
var font_loaded=0;

var legends=[];
var skiplist=[];
//var timerId;

class _SetupObj {
	constructor(){
		this.PREV_obj=null;
		this.old_position={dx: 0 , dy: 0, dz: 0, 
			rx: 0, ry:0, rz:0};

		this.new_position={dx: 0 , dy: 0, dz: 0, 
			rx: 0, ry:0, rz:0};
		this.timerId=null;
	}

	set_new_position(dx,dy,dz,rx,ry,rz){
		this.new_position.dx=dx;
		this.new_position.dy=dy;
		this.new_position.dz=dz;
		this.new_position.rx=rx;
		this.new_position.ry=ry;
		this.new_position.rz=rz;

	}

	set_up_position(src_obj,dy,ry){   //animate moving
		moving=1;
		var pos=src_obj.position.y;  //move
		var dest=pos+dy;

		var pos_ry=src_obj.rotation.y; //rotate
		var dest_ry=ry;
		var dy_end=0;

		var timerId=setInterval(function(){
				if ((dest-pos)>0.01) {pos+=0.1;
				src_obj.position.y=pos;
				renderer.render(scene,camera);
				}
				else {clearInterval(timerId);
				dy_end=1;		    
				}
				},10);


		var timerId_ry=setInterval(function() {
				if (dy_end) {
				if ((dest_ry-pos_ry)>0.01) {pos_ry+=0.1;
				src_obj.rotation.y=pos_ry;
				renderer.render(scene,camera);
				}
				else {clearInterval(timerId_ry);

				legends.forEach ((item,i,next) => {
						if (item.id==src_obj.id) {item.object.position.y=dest;
						item.object.rotation.y=dest_ry;
						//console.log(item.object.position.y, dest);
						item.object.visible=true;
						}
						});
					
				renderer.render(scene,camera);
				moving=0;
				}
				}
				},50);
	}

	change_property(cur_obj){


		if(this.PREV_obj){
			this.PREV_obj.position.x-=this.new_position.dx;
			this.PREV_obj.position.y-=this.new_position.dy;
			this.PREV_obj.position.z-=this.new_position.dz;

			this.PREV_obj.rotation.x=this.old_position.rx;
			this.PREV_obj.rotation.y=this.old_position.ry;
			this.PREV_obj.rotation.z=this.old_position.rz;

			legends.forEach ((item,i,next) => {
					if (item.id==this.PREV_obj.id) {item.object.position.y-=this.new_position.dy;
					item.object.rotation.y=this.PREV_obj.rotation.y;
					//console.log(item.object.position.y);
					item.object.visible=false;
					}
					});
		}

		this.PREV_obj=cur_obj;  //modify global objects

		if (cur_obj) {
			this.old_position.rx=cur_obj.rotation.x;
			this.old_position.ry=cur_obj.rotation.y;
			this.old_position.rz=cur_obj.rotation.z;

			cur_obj.position.x+=this.new_position.dx;
			//cur_obj.position.y+=this.new_position.dy;
			cur_obj.position.z+=this.new_position.dz;

			//cur_obj.rotation.x=this.new_position.rx;
			//cur_obj.rotation.y=this.new_position.ry;
			//cur_obj.rotation.z=this.new_position.rz;

			this.set_up_position(cur_obj,this.new_position.dy,this.new_position.ry);
			//console.log(legends,cur_obj.id);
			//obj_list.forEach((item) => {
			//		if(item.name==cur_obj.name) {if (item.id>4) click_chambers(item.id,item.id+1); else click_chambers(item.id,100)};
			//		});
			
			console.log(cur_obj.id);
		}
		renderer.render(scene,camera);
	}
}

function start()
{
	var timerId = setTimeout(() => {console.log('render');
			render();},100);
}

function loader_font(){

			loader.load( 'fonts/font.json', function ( response ) {

			font = response;
			font_loaded=1;
			load_scene();
			});
}

function createText(txt) {

var text=txt;
var text_material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ); // side

var textGeo = new THREE.TextGeometry( text, {
font: font,
size: 0.5,
height:0.1
});


// "fix" side normals by removing z-component of normals for side faces
// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

var textMesh1 = new THREE.Mesh( textGeo, text_material );

textMesh1.position.x = 0;
textMesh1.position.y = 0;
textMesh1.position.z = 0;

textMesh1.rotation.x = 0;
textMesh1.rotation.y = 0;

scene.add(textMesh1);
return textMesh1;
}

function load_scene() {

	objectLoader.load("javascripts/scene.json", function ( obj ) {
			scene_obj=obj.children.slice();
			//	console.log(scene_obj);
			scene_obj.forEach((item,i,arr) => {scene.add(item);
					//console.log(item);
					switch (item.name){
					case 'Chamber1': obj_list.push({name: item.name, id: 1}); break;
					case 'Chamber2': obj_list.push({name: item.name, id: 2}); break;
					case 'Chamber3': obj_list.push({name: item.name, id: 3}); break;
					case 'Chamber4': obj_list.push({name: item.name, id: 4}); break;
					case 'Chamber5_6': obj_list.push({name: item.name, id: 5}); break;
					case 'Chamber7_8': obj_list.push({name: item.name, id: 7}); break;
					case 'Chamber9_10': obj_list.push({name: item.name, id: 9}); break;
					}

					if (item.name.indexOf('Chamber')>-1)
					{
					//add legend
					var legend_geometry = new THREE.Geometry();
					var legend_geometry2 = new THREE.Geometry();
					var legend_geometry3 = new THREE.Geometry();

					var line_material = new THREE.LineBasicMaterial({color: 0x00ff00});
					//console.log('coordinates: ', item.position.x, item.position.y);
					//console.log('object: ', item);

					//axis
					legend_geometry.vertices.push(new THREE.Vector3(+(item.geometry.parameters.width)/2,
								-0.5-(item.geometry.parameters.height)/2,
								0.2));

					legend_geometry.vertices.push(new THREE.Vector3(-0.5-(item.geometry.parameters.width)/2,
								-0.5- (item.geometry.parameters.height)/2, 
								0.2));

					legend_geometry.vertices.push(new THREE.Vector3(-0.5-(item.geometry.parameters.width)/2,
								+(item.geometry.parameters.height)/2, 
								0.2));


					//arrows
					legend_geometry2.vertices.push(new THREE.Vector3(+(item.geometry.parameters.width)/2 - 0.1,
								-0.5- (item.geometry.parameters.height)/2 + 0.1, 
								0.2));

					legend_geometry2.vertices.push(new THREE.Vector3(+ (item.geometry.parameters.width)/2,
								-0.5- (item.geometry.parameters.height)/2, 
								+0.2));

					legend_geometry2.vertices.push(new THREE.Vector3(+ (item.geometry.parameters.width)/2 - 0.1,
								-0.5 - (item.geometry.parameters.height)/2 - 0.1, 
								+0.2));

					legend_geometry3.vertices.push(new THREE.Vector3(-0.5- (item.geometry.parameters.width)/2 - 0.1,
								+ (item.geometry.parameters.height)/2 - 0.1, 
								+0.2));

					legend_geometry3.vertices.push(new THREE.Vector3(-0.5- (item.geometry.parameters.width)/2,
								+ (item.geometry.parameters.height)/2, 
								+0.2));

					legend_geometry3.vertices.push(new THREE.Vector3(-0.5- (item.geometry.parameters.width)/2 + 0.1,
								+ (item.geometry.parameters.height)/2 - 0.1, 
								+0.2));

					//-----------------------------------
					var line = new THREE.Line(legend_geometry,line_material);
					line.position.x=item.position.x;
					line.position.y=item.position.y;
					line.position.z=item.position.z;

					var line2 = new THREE.Line(legend_geometry2,line_material);
					line2.position.x=item.position.x;
					line2.position.y=item.position.y;
					line2.position.z=item.position.z;

					var line3 = new THREE.Line(legend_geometry3,line_material);
					line3.position.x=item.position.x;
					line3.position.y=item.position.y;
					line3.position.z=item.position.z;

					//----------texts---------------
					var width = item.geometry.parameters.width;
					var lab,lab_x,lab_y;
					var str=item.name;
					var re= /Chamber(\w*)_(\w*)/;
					lab=str.match(re);
					if (lab!==null) {lab_x=lab[1]; lab_y=lab[2];}
					else {lab_x ="x"; lab_y="y";}

					var txt_x=createText("Ch_"+lab_x);
					txt_x.position.x=item.position.x;
					txt_x.position.y=item.position.y;
					txt_x.position.z=item.position.z;
					
					txt_x.geometry.vertices.map((item) => {
							return item.y+=- 1.5- width/2;
							});
					
					var txt_y=createText("Ch_"+lab_y);
					txt_y.position.x=item.position.x;
					txt_y.position.y=item.position.y;
					txt_y.position.z=item.position.z;
					
					txt_y.geometry.vertices.map((item) => {
							return item.x+=- 2.5- width/2;
							});

					legends.push({id: item.id,
							object: line});
					legends.push({id: item.id,
							object: line2});
					legends.push({id: item.id,
							object: line3});
					legends.push({id: item.id,
							object: txt_x});
					legends.push({id: item.id,
							object: txt_y});

					line.visible=false;
					line2.visible=false;
					line3.visible=false;
					txt_x.visible=false;
					txt_y.visible=false;
					
					scene.add(line);
					scene.add(line2);
					scene.add(line3);
					}

					//console.log(legends);
			});
	//});
	});
}

function init() {
	//	console.log (setupObj.new_position.x,setupObj.new_position.y,setupObj.new_position.z);
	//camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.x= 20;
	camera.position.z= 10;
	camera.position.y= 0;

	scene = new THREE.Scene();
	raycaster = new THREE.Raycaster();
	renderer = new THREE.WebGLRenderer();

	setupObj = new _SetupObj();
	setupObj.set_new_position(0,7,0,0,1.1,0);
	renderer.setSize(window.innerWidth/size_ratio, window.innerHeight/size_ratio);
	renderer.setPixelRatio( window.devicePixelRatio );
	//document.body.appendChild(renderer.domElement);
	document.getElementById("webgl").appendChild(renderer.domElement);
	renderer.setClearColor( 0xffffff );


	/*var geometry = new THREE.BoxGeometry( 10, 10, 10 );
	  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	  var cube = new THREE.Mesh( geometry, material );
	  scene.add( cube );*/

	/*  geometry = new THREE.BoxGeometry( 10, 10, 10 );
	    material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
	    cube = new THREE.Mesh( geometry, material );
	    cube.position.x=20;
	    cube.position.y=20;
	    scene.add(cube);*/

	//camera.position.z = 50;

	var ambient = new THREE.AmbientLight( 0x444444 );
	scene.add( ambient );

	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 ).normalize();
	scene.add( directionalLight );
	
	loader_font();
//	createText("abcd");
//	while (font_loaded==0); 
//	load_scene();	
	//add legend for each object

	//-------------------------------------

	document.addEventListener( 'click', onDocumentMouseMove,'false');
	window.addEventListener( 'resize', onWindowResize, false );
	//
}

function click_chambers(id1,id2)
{
console.log('clicked:', id1+'_'+id2);
angular.element(document).scope().$$childTail.getChambers2(id1,id2,1);
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth/size_ratio, window.innerHeight/size_ratio );
	renderer.render( scene, camera );

}

function onDocumentMouseMove( event ) {
	if (moving==0) {event.preventDefault();
		var div_left=document.getElementById('webgl').offsetLeft;
		var div_top=document.getElementById('webgl').offsetTop;
		//mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
		//mouse.y = - (event.clientY / window.innerHeight ) * 2 + 1;
		
		mouse.x = (size_ratio*(event.clientX-div_left) / window.innerWidth ) * 2 - 1;
		mouse.y = -(size_ratio*(event.clientY-div_top) / window.innerHeight ) * 2 + 1;
		render();
		renderer.render( scene, camera );
	}
}

//
function animate() {
	requestAnimationFrame( animate );
//	if(first_time>0) {render();
//		first_time--;
//	}
}

function render() {

	camera.lookAt( scene.position );
	// find intersections
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children);
	if (( intersects.length > 0 )){	
		if (intersects[0].object.name.indexOf('Chamber')>-1)
		{//console.log(intersects);
			prev_id=id;
			id=intersects[0].object.id;

			if (id!=prev_id) {
			obj_list.forEach((item) => {
					if(item.name==intersects[0].object.name) {if (item.id>4) click_chambers(item.id,item.id+1); else click_chambers(item.id,100)};
					});
			setupObj.change_property(intersects[0].object);
			}
		}

	}
	else {
		prev_id=id;
		id=-1;
		if(prev_id!=id) { console.log(id);setupObj.change_property(null);}
	}

	//renderer.render( scene, camera );
	//tst(renderer);

}

function select_gl_chamber(ch1,ch2)
{	
	var cur_id;
	var cur_name;

	if (ch2==100) cur_name='Chamber'+ch1;
	else cur_name='Chamber'+ch1+'_'+ch2;
	scene_obj.forEach((item) => {
				if(item.name==cur_name) {
				console.log(item.name);
				prev_id=id;
				id=item.id;
				setupObj.change_property(item);
				}
			});
}

var app=angular.module('nodeTodo', [])

app.controller('mainController', ($scope, $http, $interval) => {

var chamber_num=0;
var db_query='';
var query_id1=null,query_id2=null;
var chart1=angular.element(document.getElementById('chart21'));
var chart2=angular.element(document.getElementById('chart22'));

var webgl_element=angular.element(document.getElementById('webgl'));
var gl_show = true;

  $scope.formData = {};
  $scope.boardsData = {};
  $scope.chambersData = {};
  $scope.files_list= {};

  // Get all todos
  //$http.get('/api/v1/todos?name=""')
  //.success((data) => {
   // $scope.boardsData = data;
  //  console.log(data);
 // })
  //.error((error) => {
  //  console.log('Error: ' + error);
  //});

$scope.getFiles = () => {
			document.getElementById('chart22').innerHTML='';
   $http.get('/get_files')
	.success((data)=>{
			$scope.files_list=data;		
			console.log(data);
			})
	.error((error) => {console.log('Error: ' + error);
			  }
	      );
     };

$scope.switch_webgl = () => {
gl_show=(!gl_show);
if (gl_show==false) webgl_element.css('visibility','hidden');
else webgl_element.css('visibility','visible');
};


$scope.getBoards = () => {
  $http.get('/api/v1/todos?name="boards"')
  .success((data) => {
    $scope.boardsData = data;
    tst_data_set.data=data[0].data;
    drawHistogram();
   // console.log(tst_data_set);
  })
  .error((error) => {
    console.log('Error: ' + error);
  });
};

$scope.getChambers2 = (chamberID1,chamberID2,gl_en) => {
  if (moving==0) 
  {
  console.log('ChamberID: '+chamberID1+'_'+chamberID2);
  if (gl_en!=1) select_gl_chamber(chamberID1,chamberID2); 
  query_id1='/api/v1/todos?name="chambers"&id='+chamberID1;
  chambersQuery1;

  if(chamberID2!=100) {
  chart2.css("visibility","visible");//show plot2
  query_id2='/api/v1/todos?name="chambers"&id='+chamberID2;
  chambersQuery2;
  }
  else chart2.css("visibility","hidden");//hide plot2
  }
};

var timer=$interval(chambersQuery1 = () =>{
if (query_id1){
  $http.get(query_id1)
  .success((data) => {
    $scope.chambersData = data;
    
    tst_data_set[0].data=data[0].data;
    drawHistogram();
  })
  .error((error) => {
    console.log('Error: ' + error);
  });
 }
},1000);


var timer2=$interval(chambersQuery2 = () =>{
if (query_id2) {
  $http.get(query_id2)
  .success((data) => {
    $scope.chambersData = data;
    
   tst_data_set[1].data=data[0].data;
    drawHistogram()
  })
  .error((error) => {
    console.log('Error: ' + error);
  });
 }
},1000);


});

var google_data1, google_data2;
var chart1, chart2;
var inited=0;

function initHistogram(){
google_data1 = google.visualization.arrayToDataTable([
['x','y'],
[1,0]
]);

google_data2 = google.visualization.arrayToDataTable([
['x','y'],
[1,0]
]);

chart1 = new google.visualization.ColumnChart(document.getElementById('chart21'));
chart2 = new google.visualization.ColumnChart(document.getElementById('chart22'));
inited=1;
}

function drawHistogram(){
            // Create the data table.
//console.log('data in directive:' + tst_data_set.data);
//initHistogram();
if (inited){
google_data1 = google.visualization.arrayToDataTable([
['x','y'],
[1,0]
]);

google_data2 = google.visualization.arrayToDataTable([
['x','y'],
[1,0]
]);
//google_data.addColumn('x','y');
//google_data.addRow([3,3005]);
tst_data_set[0].data.forEach(function(item,i,arr)
{
	google_data1.addRow([i,item]);
});

tst_data_set[1].data.forEach(function(item,i,arr)
{
	google_data2.addRow([i,item]);
});

var options = {'title':'Wire',
	bar: { groupWidth: "90%" },
                           'width':500,
                           'height':500};
    
//chart1 = new google.visualization.ColumnChart(document.getElementById('chart21'));
//chart2 = new google.visualization.ColumnChart(document.getElementById('chart22'));
// Instantiate and draw our chart, passing in some options.
chart1.draw(google_data1, options);
chart2.draw(google_data2, options);
}
};


//google.setOnLoadCallback(drawHistogram);
google.load('visualization', '1', {packages: ['corechart'],callback: initHistogram});
init();
start();
animate();

//---------------------------------------------------------------------
//var tst_data_set={data:[5,10,15,20,25,30,35,30,24,22,19,14,9,5,0]};
