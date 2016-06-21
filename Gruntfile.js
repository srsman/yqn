module.exports = function(grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  // 项目配置
  grunt.initConfig({
    // 元数据
    pkg: grunt.file.readJSON('package.json'),

    // 配置文件
    cfg: grunt.file.readJSON('grunt_config.json'),

    // 注释头
    banner: '/*!\n' +
          ' * name: <%= pkg.name %>\n' +
          ' * version: <%= pkg.version %>\n' +
          ' * author: <%= pkg.author %>\n' +
          ' * Copyright (c) 2015 - <%= grunt.template.today("yyyy") %>\n' +
          ' */',

    // 清除文件，为重新编译做准备
    clean: {
      dist: {
        src: [
          '<%= cfg.dist.js %>',
          '<%= cfg.dist.css %>',
          '<%= cfg.dist.fonts %>',
          'favicon.ico'
        ]
      },
      images: {
        src: ['<%= cfg.dist.images %>']
      },
      fontawesome: {
        src: ['<%= cfg.dist.lib %>/font-awesome']
      }
    },

    // 提取Bower安装的组件
    bower: {
      dist: {
        options: {
          targetDir: './<%= cfg.dist.lib %>', // 目标目录
          layout: 'byComponent', // 文件目录类型
          install: true,
          verbose: false,
          cleanTargetDir: true, // 清理目标目录
          cleanBowerDir: false, // 清理bower组件目录
          bowerOptions: {}
        }
      }
    },

    // 复制文件
    copy: {
      icon: {
        files:[
          {
            expand: true,
            cwd: 'static',
            src: 'favicon.ico',
            dest: 'public'
          }
        ]
      },
      fontawesome: {
        files:[
          {
            expand: true,
            cwd: 'bower_components/font-awesome/fonts',
            src: ['*'],
            dest: '<%= cfg.dist.fonts %>/font-awesome'
          }
        ]
      },
      plugins: {
        files: [
          {
            expand: true,
            cwd: '<%= cfg.src.lib %>',
            src: [
              '*',
              '**/*'
            ],
            dest: '<%= cfg.dist.lib %>'
          },
          {
            expand: true,
            cwd: '<%= cfg.src.plugins %>',
            src: [
              '*',
              '**/*'
            ],
            dest: '<%= cfg.dist.plugins %>'
          }
        ]
      },
      images: {
        files:[
          {
            expand: true,
            cwd: '<%= cfg.src.images %>',
            src: [
              '*.{png,jpg,gif}',
              '**/*.{png,jpg,gif}'
            ],
            dest: '<%= cfg.dist.images %>'
          }
        ]
      }
    },

    // 压缩图片
    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= cfg.src.images %>',
            src: [
              '*.{png,jpg,gif}',
              '**/*.{png,jpg,gif}',
              '!loading.gif'
            ],
            dest: '<%= cfg.dist.images %>'
          }
        ]
      }
    },

    // 编译Less
    less: {
      dist: {
        options: {
          banner: '<%= banner %>',
          compress: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= cfg.src.css %>',
            src: [
              '*index.less',
              '**/*index.less',
              '!common/*.less',
              '!**/common/*.less',
              '!mixins/*.less',
              '!**/mixins/*.less'
            ],
            dest: '<%= cfg.dist.css %>',
            ext: '.css'
          }
        ]
      }
    },

    // 模板预编译
    tmod: {
      template: {
        src: '<%= cfg.src.tpls %>/**/*.tpl',
        dest: '<%= cfg.dist.js %>/template.js',
        options: {
          base: '<%= cfg.src.tpls %>',
          combo: true,
          helpers:'./utils/tmod_helper.js'
        }
      }
    },

    // Js语法检查
    jshint: {
      options: {
        jshintrc: true,
        force: true
      },
      files: {
        src: [
          'app.js',
          '<%= cfg.src.utils %>/*.js',
          '<%= cfg.src.utils %>/**/*/js',
          '<%= cfg.src.routes %>/*.js',
          '<%= cfg.src.routes %>/**/*.js',
          '<%= cfg.src.js %>/*.js',
          '<%= cfg.src.js %>/**/*.js',
          '!<%= cfg.src.lib %>/*.js',
          '!<%= cfg.src.lib %>/**/*.js'
        ]
      }
    },

    // 压缩Js
    uglify: {
      dist: {
        options: {
          banner: '<%= banner %>'
        },
        files: [
          {
            expand: true,
            cwd: '<%= cfg.src.js %>',
            src: [
              '*.js',
              '**/*.js',
              '!lib/*.js',
              '!lib/**/*.js'
            ],
            dest: '<%= cfg.dist.js %>'
          }
        ]
      }
    },

    // ExpressJs服务
    express: {
      options: {
        port: 2176
      },
      service: {
        options: {
          script: 'bin/www'
        }
      }
    },

    // 监听文件修改
    watch: {
      options: {
        dateFormat: function(time) {
          grunt.log.writeln('此次监听共历时' + time + '毫秒');
        }
      },
      less: {
        files: [
          '<%= cfg.src.css %>/*.less',
          '<%= cfg.src.css %>/**/*.less'
        ],
        tasks: ['less']
      },
      tmod: {
        files: ['<%= cfg.src.tpls %>/**/*.tpl'],
        tasks: ['tmod']
      },
      uglify: {
        files: [
          '<%= cfg.src.js %>/*.js',
          '<%= cfg.src.js %>/**/*.js',
          '!<%= cfg.src.lib %>/*.js',
          '!<%= cfg.src.lib %>/**/*.js'
        ],
        tasks: ['jshint', 'uglify']
      },
      images: {
        files: [
          '<%= cfg.src.images %>/*.{png,jpg,gif}',
          '<%= cfg.src.images %>/**/*.{png,jpg,gif}'
        ],
        tasks: ['imagemin']
      },
      express: {
        files: [
          'app.js',
          '<%= cfg.src.utils %>/*.js',
          '<%= cfg.src.utils %>/**/*.js',
          '<%= cfg.src.routes %>/*.js',
          '<%= cfg.src.routes %>/**/*.js'
        ],
        tasks: ['jshint', 'express:service'],
        options: {
          spawn: false
        }
      }
    }
  });

  // 压缩图片任务
  grunt.registerTask('images', ['imagemin']);

  // 执行重建任务
  grunt.registerTask('rebuild', [
    'clean:dist',
    'bower',
    'clean:fontawesome',
    'copy',
    'less',
    'tmod',
    'jshint',
    'uglify'
  ]);

  // 开发环境重建任务
  grunt.registerTask('dev', [
    'rebuild'
  ]);

  // 生成环境重建任务
  grunt.registerTask('pro', [
    'rebuild',
    'clean:images',
    'images'
  ]);

  // 执行启动服务及监听任务
  grunt.registerTask('default', [
    'dev',
    'express:service',
    'watch'
  ]);

};