module.exports = function (grunt) {
    'use strict';

    // get grunt options (console command parameters)
    var sUser = grunt.option('user');
    var sPwd = grunt.option('pwd');

    // load grunt plugins
    require('jit-grunt')(grunt, {
        openui5_preload: 'grunt-openui5',
        configureProxies: 'grunt-connect-proxy2',
        nwabap_ui5uploader: 'grunt-nwabap-ui5uploader'
    });

    // create config
    grunt.initConfig({
        settings: {
            connect: {
                host: 'localhost',
                port: 8001
            }
        },

        portPick: {
            options: {
                hostname: '<%= settings.connect.host %>',
                port: 9500
            },
            test: {
                targets: [
                    'settings.connect.port'
                ]
            }
        },

        eslint: {
            main: {
                src: [
                    //'webapp/**/*.js',
                    '!webapp/libs/**',
                ]
            }
        },

        clean: {
            main: {
                src: ['build/**/*']
            },
            jsdoc: {
                src: ['doc/**/*']
            }
        },

        jsdoc: {
            dist: {
                src: ['webapp/**/*.js', 'README.md'],
                options: {
                    "template": "node_modules/foodoc/template",
                    configure: "jsdoc.json",
                    destination: 'doc'
                }
            }
        },

        // codingpolicy: {
        //     "all": {
        //         src: ['codingpolicy.yaml'],
        //         options: {
        //             root: "./webapp"
        //     }
        //     }
        // },

        lineending: {
            dist: {
                options: {
                    eol: 'crlf',
                    overwrite: true
                },
                files: [{
                    expand: true,
                    cwd: 'doc',
                    src: ['**'],
                }]
            }
        },

        copy: {
            jsdoc: {
                files: [
                    {
                        expand: true,
                        cwd: 'doc',
                        src: ['**'],
                        dest: 'build/doc'
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'webapp',
                        src: ['**',
                            '!test/**',
                            '!libs/**',
                            '!localService/**'],
                        dest: 'build/'
                    }
                ]
            },
            properties: {
                files: [
                    {
                        expand: true,
                        cwd: 'webapp',
                        src: ['**/*i18n*.properties',
                            '!test/**',
                            '!libs/**',
                            '!localService/**'],
                        dest: './translation'
                    }
                ]
            }
        },

        env: {
            coverage: {
                APP_DIR_FOR_CODE_COVERAGE: '../test/coverage/instrument/app/'
            }
        },
        instrument: {
            files: 'webapp/**/*.js',
            options: {
                lazy: true,
                basePath: 'test/coverage/instrument/'
            }
        },
        storeCoverage: {
            options: {
                dir: 'test/coverage/reports'
            }
        },
        makeReport: {
            src: 'test/coverage/reports/**/*.json',
            options: {
                type: 'lcov',
                dir: 'test/coverage/reports',
                print: 'detail'
            }
        },

        openui5_preload: {
            main: {
                options: {
                    resources: {
                        cwd: 'build',
                        prefix: 'AdminApplication',
                        src: [
                            '**/*.js',
                            '**/*.fragment.html',
                            '**/*.fragment.json',
                            '**/*.fragment.xml',
                            '**/*.view.html',
                            '**/*.view.json',
                            '**/*.view.xml',
                            '**/*.properties'
                        ]
                    },
                    dest: 'build'
                },
                components: true
            }
        },


        connect: {
            options: {
                protocol: 'https',
                open: true,
                // key: grunt.file.read('certificate/server.key').toString(),
                //cert: grunt.file.read('certificate/server.crt').toString(),
                //ca: grunt.file.read('certificate/ca.crt').toString(),
                hostname: '<%= settings.connect.host %>',
                port: '<%= settings.connect.port %>',
                middleware: function (connect, options, defaultMiddleware) {
                    var aMiddlewares = [];
                    aMiddlewares.push(require('grunt-connect-proxy2/lib/utils').proxyRequest);
                    aMiddlewares.push(defaultMiddleware);
                    return aMiddlewares;
                }
            },
            serveWebapp: {
                options: {
                    base: ['webapp']
                },
            },
            serveWebappOpen: {
                options: {
                    open: true,
                    base: ['webapp']
                },
            },
            serveWebappTest: {
                options: {
                    open: false,
                    protocol: "https",
                    base: ['webapp']
                },
            },
            serveBuildOpen: {
                options: {
                    open: true,
                    base: ['build']
                },
            },
            proxies: [
                {
                    context: '/resources',
                    host: 'msas6245i.msg.de',   //https://msas6245i.msg.de:8001
                    port: '8001',
                    https: true,
                    ws: false,
                    secure: false,
                    changeOrigin: false,
                    rewrite: {
                        '/resources': '/sap/public/bc/ui5_ui5/resources'
                    }
                }, {
                    context: '/sap/opu/odata',
                    host: 'msas6245i.msg.de',   //https://msas6245i.msg.de:8001
                    port: '8001',
                    https: true,
                    ws: false,
                    secure: false,
                    changeOrigin: false,
                }
            ]
        },

        xml_validator: {
            your_target: {
                src: ['webapp/**/*.xml']
            }
        },

        watch: {
            options: {
                livereload: false
            },
            mainWebapp: {
                files: ['webapp/**/*'],
                tasks: ['eslint']
            },
            liveReloadWebapp: {
                files: ['webapp/build/*'],
                tasks: ['eslint']
            },
            liveReloadBuild: {
                files: ['webapp/build/*'],
                tasks: ['eslint', 'doBuild']
            }
        },

        qunit: {
            options: {
                '--web-security': 'no',
                '--disk-cache': 'true',
                '--disk-cache-path': '_phantom_js/cache',
                '--remote-debugger-autorun': 'true',
                '--remote-debugger-port': '8999'
            },
            all: {
                options: {
                    page: {
                        viewportSize: { width: 1920, height: 1080 }
                    },
                    timeout: 50000,
                    urls: [
                        'http://<%= settings.connect.host %>:<%= settings.connect.port %>/test/integration/opaTests.qunit.html'
                    ]
                }
            }
        },

        nwabap_ui5uploader: {
            upload: {
                options: {
                    conn: {
                        server: 'https://msas6245i.msg.de:8001',
                        useStrictSSL: false
                    },
                    auth: {
                        user: sUser,
                        pwd: sPwd
                    },
                    ui5: {
                        language: 'EN',
                        package: 'Z_INSURANCE_COMP',
                        bspcontainer: 'ZINS_DMGFILE',
                        bspcontainer_text: 'Damage File App',
                        transportno: 'SA8K902974',
                        calc_appindex: 'true'
                    },
                    resources: {
                        cwd: 'build',
                        src: '**/*.*'
                    }
                }
            }
        },

    });

    // register combined tasks
    grunt.registerTask('doWatch', ['watch:mainWebapp']);
    grunt.registerTask('doServeWebapp', ['configureProxies:server', 'connect:serveWebappOpen', 'watch:liveReloadWebapp']);
    grunt.registerTask('doServeOnBuild', ['configureProxies:server', 'connect:serveBuildOpen', 'watch:liveReloadBuild']);
    grunt.registerTask('doBuild', ['eslint', 'clean', 'copy', 'openui5_preload']);
    grunt.registerTask('doUpload', ['xml_validator', 'doBuild', 'nwabap_ui5uploader:upload']);
    grunt.registerTask('doTest', ['configureProxies:server', 'portPick:test', 'connect:serveWebappTest', 'qunit_puppeteer:test']);

    // gegister task for translation (=collect i18n files)
    grunt.registerTask('doCollectI18n', ['copy:properties']);

    // register default task
    grunt.registerTask('default', ['doBuild']);
}