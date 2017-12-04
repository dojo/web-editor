export = function(grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-patcher');

	return {
		indexJs: {
			options: {
				patch: 'support/grunt/patches/index.js.patch'
			},
			files: {
				'dist/examples/index.js': 'dist/examples/index.js'
			}
		},

		liveJs: {
			options: {
				patch: 'support/grunt/patches/live.js.patch'
			},
			files: {
				'dist/examples/live.js': 'dist/examples/live.js'
			}
		},

		workerProxyJs: {
			options: {
				patch: 'support/grunt/patches/worker-proxy.js.patch'
			},
			files: {
				'dist/support/worker-proxy.js': 'dist/support/worker-proxy.js'
			}
		}
	};
};
