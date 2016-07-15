'use strict';

/**
 * @ngdoc directive
 * @name transportApp.directive:attachment
 * @description
 * # attachment
 */
angular.module('transportApp')
  .directive('attachment', function () {
  return {
		    restrict: 'E',
		    replace: true,
		    scope: {
		        attachments: '='
		    },
		    controller: function($scope) {
		    	$scope.removeImage = function(index) {
		    		$scope.attachments.splice(index,1);
                    document.getElementById('driverImage').value = "";
		    	};
		    	$scope.formatBytes = function(bytes,decimals) {
				   if(bytes == 0) return '0 Byte';
				   var k = 1000; // or 1024 for binary
				   var dm = decimals + 1 || 3;
				   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
				   var i = Math.floor(Math.log(bytes) / Math.log(k));
				   return parseInt((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
				};
				$scope.imagePreview = function(file) {
					if (typeof FileReader != undefined && FileReader) {
						var id = file.name.split('.')[0]+'_'+file.size+'_'+file.lastModified, str = "";
			            if (!file.type.match('image')) {
			            	str = '<p style="height:100px;width:100px;display:inline-block;text-align:center;background:#000;color:#fff;word-break:break-all;padding-top:40px;margin:5px;float:left;white-space:normal;"><b>'+file.type+'</b></p>';
			            	$('#' + id).html(str);
			            	return;
			            }

			            var picReader = new FileReader();
			            picReader.addEventListener("load", function (event) {
			                str = '<img src="'+event.target.result+'" title="'+file.name+'" style="height:100px;margin:5px;" />';
			                angular.element('#' + id).html(str);
			            });
			            //Read the image
			            picReader.readAsDataURL(file);
				    } else {
				        console.log("Your browser does not support File API");
				        return;
				    }
				};
		    },
		    templateUrl: 'views/attachment.html'
		}
  });
