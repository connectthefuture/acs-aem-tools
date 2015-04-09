/*
 * #%L
 * ACS AEM Tools Package
 * %%
 * Copyright (C) 2014 Adobe
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */

/*global angular: false, ace: false */

var vltApp = angular.module('vltApp',['ngDialog']);

vltApp.controller('MainCtrl', function($scope, $http, $timeout, $interval, ngDialog) {
	
	$scope.rcp_uri = '/libs/granite/packaging/rcp';
	
	$scope.task_src = 'http://admin:admin@localhost:4502/crx/server/-/jcr:root/content/dam/geometrixx';

	$scope.task_dst = '/content/dam/geometrixx2';
	
	$scope.checkboxModel = {
        recursive : true,
        update : true,
        onlyNewer : true,
        noOrdering : false,
        autoRefresh : false
	};
    $scope.app = {
        uri: '',
        running: false
    };

    $scope.notifications = [];

    $scope.tasks = [];

    /*
     * Loads the tasks
     */
    $scope.init = function() {
        $http({
            method: 'GET',
            url: $scope.rcp_uri,
            params: { ck: (new Date()).getTime() }
        }).
        success(function(data, status, headers, config) {
            $scope.tasks = data.tasks || [];
        }).
        error(function(data, status, headers, config) {
            $scope.addNotification('error', 'ERROR', 'Could not retrieve tasks.');
        });
    };
    
    $scope.addNotification = function (type, title, message) {
        var timeout = 10000;

        if(type === 'success')  {
            timeout = timeout / 2;
        }

        $scope.notifications.unshift({
            type: type,
            title: title,
            message: message
        });

        $timeout(function() {
            $scope.notifications.shift();
        }, timeout);
    };

    /*
     * Start task
     */
    $scope.start = function(task) {
        var cmd = {
            "cmd":"start",
            "id": task.id
        };
    
        $http.post($scope.rcp_uri, cmd).
        success(function(data, status, headers, config) {
            $scope.addNotification('info', 'INFO', 'Task '+task.id+' started.');
            $scope.init();
        }).
        error(function(data, status, headers, config) {
            $scope.addNotification('error', 'ERROR', 'Could not retrieve tasks.');
        });
    };

    /*
     * Stop task
     */
    $scope.stop = function(task) {
        var cmd = {
            "cmd":"stop",
            "id": task.id
        };
    
        $http.post($scope.rcp_uri, cmd).
        success(function(data, status, headers, config) {
            $scope.addNotification('info', 'INFO', 'Task '+task.id+' stopped.');
            $scope.init();
        }).
        error(function(data, status, headers, config) {
            $scope.addNotification('error', 'ERROR', 'Could not retrieve tasks.');
        });
    };

    /*
     * Remove task
     */
    $scope.remove = function(task) {
        var cmd = {
            "cmd":"remove",
            "id": task.id
        };
    
        $http.post($scope.rcp_uri, cmd).
        success(function(data, status, headers, config) {
            $scope.addNotification('info', 'INFO', 'Task '+task.id+' removed.');
            $scope.init();
        }).
        error(function(data, status, headers, config) {
            $scope.addNotification('error', 'ERROR', 'Could not retrieve tasks.');
        });
    };
    
    $scope.confirm = function() {
        var cmd = {
            "cmd":"create",
            "id": $scope.task_id,
            "src": $scope.task_src,
            "dst": $scope.task_dst,
            "batchsize": 2048,
            "update": $scope.checkboxModel.update,
            "onlyNewer": $scope.checkboxModel.onlyNewer,
            "recursive": $scope.checkboxModel.recursive,
            "noOrdering": $scope.checkboxModel.noOrdering,
            "throttle": 1
        };
        
        if ($scope.task_resumeFrom !== "") {
            cmd.resumeFrom = $scope.task_resumeFrom;
        }
    
        $http.post($scope.rcp_uri, cmd).
        success(function(data, status, headers, config) {
            $scope.addNotification('info', 'INFO', 'Task created.');
            $scope.closeThisDialog();
        }).
        error(function(data, status, headers, config) {
            $scope.addNotification('error', 'ERROR', 'Could not create the tasks.');
        });
    };


    /*
     * Create task
     */
    $scope.createTask = function() {
        ngDialog.open({ template: 'createTaskTemplate', controller: 'MainCtrl' });
    };
    
    $scope.$on('ngDialog.opened', function (event, $dialog) {
        $dialog.find('.ngdialog-content').css('width', '80%');
    });

    $scope.$on('ngDialog.closed', function (event, $dialog) {
        $scope.init();
    });
    
    $interval(function(){
        if ($scope.checkboxModel.autoRefresh) {
          $scope.init();
        }
    },5000);
});
