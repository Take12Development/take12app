module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: ['client/scripts/*.js',
              'client/scripts/**/*.js'],
        dest: 'server/public/scripts/client.min.js'
      }
    },
    concat: {
      scripts: {
        src: ['client/scripts/*.js',
              'client/scripts/**/*.js'],
        dest: 'server/public/scripts/client.js'
      },
    },
    copy: {
      html: {
        expand: true,
        cwd: 'client/views',
        src: ['**/*.*',
          'index.html'],
        dest: 'server/public/views/'
      },
      css: {
        expand: true,
        cwd: 'client/styles',
        src: ['style.css'],
        dest: 'server/public/styles/'
      },
      angular: {
        expand: true,
        cwd: 'node_modules/angular/',
        src: ['angular.js',
              'angular.min.js',
              'angular.min.js.map'],
        dest: 'server/public/vendors/angular/'
      },
      angularRoute: {
        expand: true,
        cwd: 'node_modules/angular-route/',
        src: ['angular-route.js',
              'angular-route.min.js',
              'angular-route.min.js.map'],
        dest: 'server/public/vendors/angular-route/'
      },
      angularmaterial: {
        expand: true,
        cwd: 'node_modules/angular-material/',
        src: ['angular-material.css',
              'angular-material.js',
              'angular-material.min.css',
              'angular-material.min.js'],
        dest: 'server/public/vendors/angular-material/'
      },
      angularanimate: {
        expand: true,
        cwd: 'node_modules/angular-animate/',
        src: ['angular-animate.js',
              'angular-animate.min.js',
              'angular-animate.min.js.map'],
        dest: 'server/public/vendors/angular-animate/'
      },
      angulararia: {
        expand: true,
        cwd: 'node_modules/angular-aria/',
        src: ['angular-aria.js',
              'angular-aria.min.js',
              'angular-aria.min.js.map'],
        dest: 'server/public/vendors/angular-aria/'
      },
      angularmessages: {
        expand: true,
        cwd: 'node_modules/angular-messages/',
        src: ['angular-messages.js',
              'angular-messages.min.js',
              'angular-messages.min.js.map'],
        dest: 'server/public/vendors/angular-messages/'
      },
      ngfileupload: {
        expand: true,
        cwd: 'node_modules/ng-file-upload/dist/',
        src: ['ng-file-upload-all.min.js'],
        dest: 'server/public/vendors/ng-file-upload/'
      },
      textangular: {
        expand: true,
        cwd: 'node_modules/textangular/dist/',
        src: ['textAngular-rangy.min.js',
              'textAngular-sanitize.min.js',
              'textAngular.min.js',
              'textAngular.css'],
        dest: 'server/public/vendors/textangular/'
      },
      chartjs: {
        expand: true,
        cwd: 'node_modules/chart.js/dist/',
        src: ['Chart.min.js'],
        dest: 'server/public/vendors/chartjs/'
      },
      angularjsslider: {
        expand: true,
        cwd: 'node_modules/angularjs-slider/dist/',
        src: ['rzslider.min.js',
              'rzslider.min.css',
              'rzslider.css'],
        dest: 'server/public/vendors/angularjsslider/'
      }

    },
    watch: {
      files: [
        'client/**/*.*'
      ],
      tasks: ['uglify', 'copy']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['uglify', 'copy', 'watch']);
};
