export = function (grunt: IGrunt) {
	grunt.loadNpmTasks('intern');

	return {
		options: {
			config: '<%= internConfig %>',
			node: {
				plugins: [
					'./support/intern/Reporter.js'
				]
			}
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
