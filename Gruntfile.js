module.exports = function( grunt ) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: '/*!\n' +
          '* <%= pkg.name %>\n' +
          '* v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
          '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
          '* (c) <%= pkg.author.name %>;' +
          ' <%= _.pluck(pkg.licenses, "type").join(", ") %> License\n' +
          '*/',
        stripBanners: true
      },
      dist: {
        files: {
          'dist/getUserMedia.js': ['lib/getUserMedia.js'],
          'dist/getUserMedia.noFallback.js': ['lib/getUserMedia.noFallback.js']
        }
      }
    },
    uglify: {
      options: {
        report: 'gzip',
        banner: '<%= concat.options.banner %>'
      },
      dist: {
        files: {
          'dist/getUserMedia.min.js': ['dist/getUserMedia.js'],
          'dist/getUserMedia.noFallback.min.js': ['dist/getUserMedia.noFallback.js']
        }
      }
    },
    watch: {
      scripts: {
        files: '<%= jshint.all %>',
        tasks: ['test']
      }
    },
    connect: {
      server: {
        options: {
          base: '.',
          port: 8080
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true
      },
      globals: {
        exports: true,
        module: true
      },
      all: ['Gruntfile.js', 'lib/getUserMedia.js', 'lib/getUserMedia.noFallback.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');


  // Release
  grunt.registerTask('default', ['jshint','concat', 'uglify']);

};