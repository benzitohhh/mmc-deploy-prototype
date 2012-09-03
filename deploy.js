(function() {
    // === handlers ========================
    $("#learn-more-button").click(function() {
        $("#hero-unit #instructions").toggle(500);
    });
    
    // === drag n drop ========================= 
    // TODO:

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
            self.applications.push(appliction);
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
        
        self.postRenderDeployment = function(domArr, deployment) {
            // TEMPORARY display
            // TODO: this should be
            //       a) done as a template
            //       b) be modifiable
            //       c) be persistant
            
            var el = $(domArr[1]);
            var apps = deployment.applications();
            var servers = deployment.servers();
            var strContent = "";
            strContent += "<h5>";
            strContent += "Apps: ";
            strContent += "</h5>";
            strContent += "<p>";
            for (var i=0; i < apps.length; i++) {
                strContent += apps[i].name();
                strContent += i==(apps.length-1) ? "" : ", ";
            };
            strContent += "<\p>";
            strContent += "<br/>";
            strContent += "<h5>";
            strContent += "Servers: ";
            strContent += "</h5>";
            strContent += "<p>";
            for (var i=0; i < servers.length; i++) {
                strContent += servers[i].name();
                strContent += i==(servers.length-1) ? "" : ", ";
            };
            strContent += "</p>";
            
            // add popover
            el.popover({
                content: strContent,
                trigger: 'hover',
                placement: 'top'
                
            });       
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
        new Deployment(301, "dep1_prod_lots", applications.slice(0,3), servers.slice(0,2), true),
        new Deployment(302, "dep2_staging_lots", applications.slice(0,3), servers.slice(2,3), true),
        new Deployment(303, "dep3_staging_one", applications.slice(0,1), servers.slice(2,3), false)
    ];
    
    // === initialise KO ===================================
    
    var vm = new DeployViewModel(applications, servers, deployments);
    ko.applyBindings(vm);

    // TODO: temporarily export vm for debug TODO: remove!!!
    this.vm = vm;
    
})();
