var app=angular.module('nodeTodo', [])
app.factory('tst_Factory', function($http){
		
			return {
			get_files: function() {
				return $http.get('/get_files')
				}
			};
		})

app.controller('fileController', ($scope, $http, $interval, $compile, tst_Factory) => {
var list_size=0;
var cur_id=0; 

$scope.files_list= {};
$scope.bk_color='blue';
$scope.processing='processing...';

$scope.onKeyDown = function ($event) {
        if ($event.keyCode==38) up_list();  //up
	if ($event.keyCode==40) down_list(); //down
        if ($event.keyCode==68) download_file(); //download
        if ($event.keyCode==72) $scope.switch_help(); //help
        if ($event.keyCode==13) change_dir(); //change currrent dir
        if ($event.keyCode==69) edit_file(); //edit
        if ($event.keyCode==80) show_file(); //preshow charge distribution
        if ($event.keyCode==71) $scope.getFiles(); //get_files
	};
	
var inner_html='';
var help_show=true;
var help_element=angular.element(document.getElementById('Help'));

$scope.switch_help = () => {
help_show=(!help_show);
if (help_show==false) help_element.css('visibility','hidden');
else help_element.css('visibility','visible');
};

$scope.getFiles = () => {
tst_Factory.get_files().success((data)=>{
		$scope.files_list=data;
 		list_size=$scope.files_list.length;
		cur_id=0;
		display_files(cur_id);
		console.log(list_size);
		console.log($scope.files_list);
		});


	/* $http.get('/get_files')
	.success((data)=>{
			$scope.files_list=data;		
			list_size=data.length;
			cur_id=0;
			console.log(data);
			console.log(list_size);
			display_files(cur_id);
			})
	.error((error) => {console.log('Error: ' + error);
			  }
	      );*/
     };

function up_list(){
if (cur_id>0) cur_id-=1;
else cur_id=0;
display_files(cur_id);
}

function down_list(){
if (cur_id<(list_size-1)) cur_id+=1;
else cur_id=list_size-1;
display_files(cur_id);
}

function change_dir(){

	var cur_filename=$scope.files_list[cur_id];
	console.log('changing to ' + cur_filename);
	
	if (cur_filename.slice(-4)!='.dat'){
	$http.post('/change_dir',{download_name: cur_filename})
		.error((error) => {console.log ('Error: '+error);})
		.success((data) => {
			console.log(data);
			$scope.getFiles();
			})
	}
};

function download_file(){
	var cur_filename=$scope.files_list[cur_id];
	console.log('downloading ' + cur_filename);
	if (cur_filename.slice(-4)=='.dat'){
	$http.post('/download_name',{download_name: cur_filename})
		.error((error) => {console.log ('Error: '+error);})
		.success((data) => {console.log(data);
				var downloadLink = document.createElement("a");
				document.body.appendChild(downloadLink);
				downloadLink.style = "display: none";

				//var file = new Blob([data], {type: 'application/octet-stream'});
				//var fileURL = (window.URL || window.webkitURL).createObjectURL(file);

				downloadLink.href ='/download';
				downloadLink.click();
				document.body.removeChild(downloadLink);
				})
	}
}

function edit_file(){
	console.log('edit ' + $scope.files_list[cur_id]);
}


function show_file(){
	console.log('showing ' + $scope.files_list[cur_id]);
   	
	var cur_filename=$scope.files_list[cur_id];
	//chek if it is file or directory
	if (cur_filename.slice(-4)=='.dat'){
	$http.post('/download_name',{download_name: cur_filename})
		.error((error) => {console.log ('Error: '+error);})
		.success((data) => {console.log(data);
			document.getElementById('script_results').innerHTML='';
			document.getElementById('processing').style.visibility='visible';
			$http.get('/get_images')

			.success((data)=>{
			console.log(data);
			console.log(data.length);
			document.getElementById('processing').style.visibility='hidden';
			var show_file_html='';
			
			data.forEach((item,i,data) => {
			show_file_html+='<a href="images/script/'+data[i]+'?'+Math.random()+'" data-fancybox data-caption="PICTURE_'+i+'"><img src="images/script/'+data[i]+'?'+Math.random()+'" height="100" width="100"></a>';
			//show_file_html+='<a href="images/script/'+data[i]+'?'+Math.random()+'"><img src="images/script/'+data[i]+'?'+Math.random()+'" height="100" width="100"></a>';
			document.getElementById('script_results').innerHTML=show_file_html;
			});
			
			
			})
	.error((error) => {console.log('Error: ' + error);
			  }
	      )});
	}
	
}

function display_files(id) {
		var i=0;
		var cur_color='';
		var files_div=angular.element(document.getElementById('Files'));
		files_div.text('');
		for (i=0;i<list_size;i++) {
			if (i==id) cur_color='p2'; else cur_color='p1';

			var new_row='<'+cur_color+' ng-click="click_on_file('+i+')">'+$scope.files_list[i]+'</'+cur_color+'><br />';
			var content=$compile(new_row)($scope);
			files_div.append(content);
		}
		
		}

$scope.click_on_file = (sel_id) => {
	//console.log('cur_id: ' + sel_id);
	cur_id=sel_id;
	display_files(cur_id);
};
});

