var async = require('async');
var helpers = require('../../../helpers/azure/');

module.exports = {
    title: 'RBAC Enabled',
    category: 'Kubernetes Service',
    description: 'Ensures that RBAC is enabled on all Azure Kubernetes Services Instances',
    more_info: 'Role Based Access Control(RBAC) provides greater control and security for Kubernetes clusters.',
    recommended_action: 'When creating a new Kubernetes Cluster, ensure that RBAC is enabled under the Authentication tab during creation.',
    link: 'https://docs.microsoft.com/en-us/azure/aks/aad-integration',
    apis: ['managedClusters:list'],

    run: function (cache, settings, callback) {
        var results = [];
        var source = {};
        var locations = helpers.locations(settings.govcloud);

        async.each(locations.managedClusters, function (location, rcb) {

            var managedClusters = helpers.addSource(cache, source, 
                ['managedClusters', 'list', location]);

            if (!managedClusters) return rcb();

            if (managedClusters.err || !managedClusters.data) {
                helpers.addResult(results, 3, 
                    'Unable to query Kubernetes clusters: ' + helpers.addError(managedClusters), location);
                return rcb();
            };

            if (!managedClusters.data.length) {
                helpers.addResult(results, 0, 'No existing Kubernetes clusters', location);
                return rcb();
            };

            managedClusters.data.forEach(managedCluster => {
                if (managedCluster.hasOwnProperty('kubernetesVersion') && managedCluster.enableRBAC) {
                    helpers.addResult(results, 0, 
                        'RBAC is enabled on the cluster.', location, managedCluster.name);
                } else {
                    helpers.addResult(results, 1, 
                        'RBAC is not enabled on the cluster.', location, managedCluster.name);
                };
            });
            
            rcb();
        }, function () {
            // Global checking goes here
            callback(null, results, source);
        });
    }
}