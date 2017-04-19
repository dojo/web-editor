export = function(grunt: IGrunt) {
	grunt.loadNpmTasks('grunt-patcher');

	return {
		editor: {
			options: {
				patch: 'support/grunt/patches/editor.js.patch'
			},
			files: {
				'dist/examples/editor.js': 'dist/examples/editor.js'
			}
		},

		indexJs: {
			options: {
				patch: 'support/grunt/patches/index.js.patch'
			},
			files: {
				'dist/examples/index.js': 'dist/examples/index.js'
			}
		},

		workerProxyJs: {
			options: {
				patch: 'support/grunt/patches/worker-proxy.js.patch'
			},
			files: {
				'dist/worker-proxy.js': 'dist/worker-proxy.js'
			}
		}
	};
};
