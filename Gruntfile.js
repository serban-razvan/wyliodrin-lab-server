'use strict';

var libs = ['bootstrap', 'vue', 'bootbox', 'lodash', 'vuex', 'vue-resource', 'vue-router', 'jquery'];

module.exports = function(grunt){
	var tasks = {
		browserify: {
			ui: {
				files: {
					'build/ui/js/login.js': ['source/ui/js/login.js']
				},
				options: {
					transform: ['vueify']
				}
			},
			vendor: {
				src: [],
				dest: 'build/ui/js/vendor.js',
				options: {
					external: null,
					require: libs
				},
			},
			options:{
				external: libs
			},
		},

		copy:
		{
			server:
			{
				files:[
					{
						expand: true,
						cwd: 'src/server',
						src: ['*'],
						dest: 'build/server/'
					},
					{
						expand: true,
						cwd: 'src/server/bin',
						src: ['*'],
						dest: 'build/server/bin/'
					},
					{
						expand: true,
						cwd: 'src/server/database',
						src: ['*'],
						dest: 'build/server/database/'
					},
					{
						expand: true,
						cwd: 'src/server/routes',
						src: ['*'],
						dest: 'build/server/routes/'
					}
				]
			},
			ui:
			{
				files:[
					{
						expand: true,
						cwd: 'src/ui/img',
						src: ['*'],
						dest: 'build/ui/img/'
					},
					{
						expand: true,
						cwd: 'src/ui/style',
						src: ['*'],
						dest: 'build/ui/style/'
					},
					{
						expand: true,
						cwd: 'src/ui/views',
						src: ['*'],
						dest: 'build/ui/views/'
					},
				]
			}
		},
		less:
		{
			files: {
				// 'build/ui/css/login.css': 'source/ui/css/login.less'
			}
		},
		eslint:
		{
			gruntfile: 'gruntfile.js',
			server:['src/server/**/*.js'],
			ui:['src/ui/**/*.js', 'src/ui/**/*.vue']
		}
	};

	grunt.initConfig(tasks);
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-eslint');

	grunt.registerTask('default',['eslint:ui','browserify', 'copy', 'less']);
};