(function() {
    // === handlers ========================
    $("#learn-more-button").click(function() {
        $("#hero-unit #instructions").toggle(500);
    });
    
    function Application(id, name) {
        var self = this;
        self.id = id;
        self.name = ko.observable(name);
    }
    
    function Server(id, name) {
        var self = this;
        self.id = id;
        self.name = ko.observable(name);
    }
    
    function Deployment(id, name, applications, servers, isDeployed) {
        var self = this;
        self.id = id;
        self.name = ko.observable(name);
        self.applications = ko.observableArray(applications);
        self.servers = ko.observableArray(servers);
        self.isDeployed = ko.observable(isDeployed);
        
        self.addApplication = function(application) {
            self.applications.push(application);
        };
        self.addServer = function(server) {
            self.servers.push(server);
        };
        self.removeApplication = function(application) {
            self.applications.remove(appliction);
        };
        self.removeServer = function(server) {
            self.servers.remove(server);
        };
        self.status = ko.computed(function() {
            return self.isDeployed() ? 'deployed ok' : 'undeployed';
        });
        
    }
    
    function DeployViewModel (apps, servers, deploys) {
        var self = this;
        
        // drag icons
        var appDragIcon = $("#appDragIcon")[0];
        var serverDragIcon = $("#serverDragIcon")[0];
        
        self.allApplications = ko.observableArray(apps);
        
        self.allServers = ko.observableArray(servers);
        
        self.deployments = ko.observableArray(deploys);
        
        self.addApplication = function() {
            self.allApplications.push(new Application(generateNextApplicationId(), "new app"));
        };
        
        self.removeApplication = function(application) {
            self.allApplications.remove(application);
            // for now, just remove from deployments
            var deps = self.deployments();
            for (var i=0; i < deps.length; i++) {
                deps[i].applications.remove(application);
            };
        };
        
        self.addServer = function() {
            self.allServers.push(new Server(generateNextServerId(), "new server"));
        };
        
        self.removeServer = function(server) {
            self.allServers.remove(server);
            // for now, just remove from deployments
            var deps = self.deployments();
            for (var i=0; i < deps.length; i++) {
                deps[i].servers.remove(server);
            };
        };
        
        self.addDeployment = function() {
            self.deployments.push(new Deployment(generateNextDeploymentId(), "new deployment", [], [], false));
        };
        
        self.removeDeployment = function(deployment) {
            self.deployments.remove(deployment);
        };
        
        function getSelectedIds(arr) {
            // get selected deployments
            var selected = $(arr).find(".selectedEntity:checked");
            return _.map(selected, function(el) {
                return $(el).next().val();
            });
        }
        
        function clearSelectedCheckBoxes(arr) {
            $(arr).find(".selectedEntity:checked").attr('checked', false);
        }
        
        self.removeSelectedDeployments = function() {
            // get selected
            var ids = getSelectedIds($("#deployments"));
            for (var i=0; i < ids.length; i++) {
                // lookup
                var d = self.getDeployment(ids[i]);
                // remove
                self.deployments.remove(d);
            };
        };
        
        self.removeSelectedApplications = function() {
            // get selected
            var ids = getSelectedIds($("#applications"));
            for (var i=0; i < ids.length; i++) {
                // lookup
                var d = self.getApplication(ids[i]);
                // remove
                self.allApplications.remove(d);
            };
        };
        
        self.removeSelectedServers = function() {
            // get selected
            var ids = getSelectedIds($("#servers"));
            for (var i=0; i < ids.length; i++) {
                // lookup
                var d = self.getServer(ids[i]);
                // remove
                self.allServers.remove(d);
            };
        };
        
        self.deploySelectedDeployments = function() {
            // get selected
            var ids = getSelectedIds($("#deployments"));
            for (var i=0; i < ids.length; i++) {
                // lookup
                var d = self.getDeployment(ids[i]);
                // deploy
                d.isDeployed(true);
            };
            clearSelectedCheckBoxes($("#deployments"));
        };
        
        self.undeploySelectedDeployments =function() {
            // get selected
            var ids = getSelectedIds($("#deployments"));
            for (var i=0; i < ids.length; i++) {
                // lookup
                var d = self.getDeployment(ids[i]);
                // undeploy
                d.isDeployed(false);
            };
            clearSelectedCheckBoxes($("#deployments"));
        };
        
        // === lookup functions ===
        
        self.getApplication = function(id) {
            return getById(id, self.allApplications());
        };
        
        self.getServer = function(id) {
            return getById(id, self.allServers());
        }
        
        self.getDeployment = function(id) {
            return getById(id, self.deployments());
        }

        function getById(id, arr) {
            for (var i=0; i < arr.length; i++) {
                if (arr[i].id == id) {
                    return arr[i];
                }
            }
            return null;
        }
        
        // ==== id generation mock functions ===
        // i.e. this would be done server-side.

        function generateNextId (arr) {
            if (arr.length == 0) {
                return 0;
            }
            return _.max(arr, function(obj) {
                return obj.id;
            }).id + 1;
        }

        function generateNextApplicationId() {
            return generateNextId(self.allApplications());
        }
        
        function generateNextServerId() {
            return generateNextId(self.allServers());
        }
        
        function generateNextDeploymentId () {
            return generateNextId(self.deployments());
        }
        
        // ==== post-render callbacks ===
        
        function bindDragHandler(el, id, type, icon, iconOffsetX, IconOffsetY) {            
            el.attr("draggable", true)
                        .bind("dragstart", function(event) {
                            event.originalEvent.dataTransfer.setData("id", id);
                            event.originalEvent.dataTransfer.setData("type", type);
                            event.originalEvent.dataTransfer.setDragImage(icon, iconOffsetX, IconOffsetY);
                        });
        }
        
        self.postRenderApplication = function(domArr, application) {
            bindDragHandler($(domArr[1]), application.id, "application", appDragIcon, -10, -10);
        };
        
        self.postRenderServer = function(domArr, server) {
            bindDragHandler($(domArr[1]), server.id, "server", serverDragIcon, -6, -5);
        };
        
        self.postRenderDeployment = function(domArr, deployment) {            
            // the DOM element representing this deployment
            var el = $(domArr[1]);
            
            // bind "drop" handlers
            el.bind("dragenter", function(event) {
                $(this).addClass("over");
            }).bind("dragleave", function(event) {
                $(this).removeClass("over");
            }).bind("dragover", function(event) {
                event.preventDefault();
            }).bind("drop", function(event) {
                event.preventDefault();
                $(this).removeClass("over");
                var sourceId = event.originalEvent.dataTransfer.getData("id"); 
                var sourceType = event.originalEvent.dataTransfer.getData("type");
                console.log("dropped with with id=" + sourceId + " and type=" + sourceType);
                if (sourceType=="application") {
                    var app = self.getApplication(sourceId);
                    deployment.addApplication(app);
                } else if (sourceType=="server") {
                    var server = self.getServer(sourceId);
                    deployment.addServer(server);
                }
            });   
        };
        
        self.postRenderDeploymentApplication = function(domArr, application) {
            // TODO:
        };
        
    }
    
    // ==== mock initial data =============================

    var applications = [
        new Application(101, "HR_app"),
        new Application(102, "Payroll_app"),
        new Application(103, "Marketing_app"),
    ];
   
    var servers = [
        new Server(201, "prod1"),
        new Server(202, "prod2"),
        new Server(203, "staging1")
    ];
   
    var deployments = [
        // new Deployment(301, "dep1_prod_lots", applications.slice(0,3), servers.slice(0,2), true),
        // new Deployment(302, "dep2_staging_lots", applications.slice(0,3), servers.slice(2,3), true),
        new Deployment(303, "dep3_staging_one", applications.slice(0,1), servers.slice(2,3), false)
    ];
    
    // === initialise KO ===================================
    
    var vm = new DeployViewModel(applications, servers, deployments);
    ko.applyBindings(vm);
    
})();
