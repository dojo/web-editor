export = function (grunt: IGrunt) {
	grunt.loadNpmTasks('intern');

	return {
		options: {
			config: '<%= internConfig %>',
			node: {
				'plugins+': [
					{ script: './dev/support/intern/Reporter.js', useLoader: true }
				],
				reporters: [
					'web-editor'
				]
			},
		},
		browserstack: {
			options: {
				config: '<%= internConfig %>@browserstack'
			}
		},
		saucelabs: {
			options: {
				config: '<%= internConfig %>@saucelabs'
			}
		},
		node: {},
		remote: {},
		local: {
			options: {
				config: '<%= internConfig %>@local'
			}
		},
		serve: {
			options: {
				serveOnly: true
			}
		}
	};
};
