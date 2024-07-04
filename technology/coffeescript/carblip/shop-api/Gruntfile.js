// Project configuration.
var pkg = require('./package.json');

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-dev-update');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-zip');
    grunt.loadNpmTasks('grunt-package-modules');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        pkg,
        mochaTest: {
            test: {
                options: {
                    reporter: 'mocha-bamboo-reporter',
                    require: 'coffee-script/register',
                    clearRequireCache:true
                },
                src: ['test/**/*.coffee']
            },
            bamboo: {
                options: {
                    reporter: 'spec',
                    require: 'coffee-script/register',
                    clearRequireCache:true
                },
                src: ['test/**/*.coffee']
            }
        },

        copy: {
            build: {
                cwd: 'src',
                src: [ '**' ],
                dest: 'dist',
                expand: true
            },
            config: {
                cwd: './',
                src: 'config/**',
                dest: 'dist/',
                expand: true
            },
            package: {
                cwd: './',
                src: [ 'package.json', 'package-lock.json', '*.md', '.npmrc', '.npmignore'],
                dest: 'dist',
                expand: true
            },
            datadog: {
                cwd: './',
                src: '.ebextensions/**',
                dest: 'dist/',
                expand: true
            }
        },

        clean: {
            build: {
                force: true,
                src: [ 'dist/*' ]
            },
            coffee: {
                force: true,
                src: [ 'dist/**/*.coffee' ]
            },
            envvars: {
                force: true,
                src: [ 'dist/config/envvars.js' ]
            }
        },

        coffee: {
            glob_to_multiple: {
                expand: true,
                cwd: 'dist',
                src: ['**/*.coffee'],
                dest: 'dist',
                ext: '.js'
            }
        },

        packageModules: {
            dist: {
                cwd: './',
                src: ['package.json'],
                dest: 'dist'
            }
        },

        release: {
            options: {
                folder: 'dist',
                afterBump: [ 'devUpdate', 'build' ],
                add: true,
                push: true,
                commit: true,
                tag: true,
                npm: true
            }
        },

        devUpdate: {
            main: {
                options: {
                    reportUpdated: false,
                    updateType: "prompt"
                }
            }
        },

        zip: {
            'using-cwd': {
                cwd: 'dist/',
                src: [ 'dist/**/*', 'dist/.ebextensions/**' ],
                dest: 'build.zip'
            }
        }
    });
    grunt.registerTask('build', [
        // Collection of tasks that build code to the 'dist' directory...
        'clean',
        'copy:build',
        'coffee',
        'clean:coffee',
        'copy:config',
        'copy:package',
        'copy:datadog',
        'clean:envvars',
        // 'packageModules',
    ]);
    grunt.registerTask('test-bamboo', 'mochaTest');
}
