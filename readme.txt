千万不要在public文件夹下写任何自己的代码，切记切记，后果自负！！！
如果要定义js插件的东西，请写在static里，再由grunt复制过去

html中class和id的命名使用xx-xx的方式，name使用xx_xx的方式

bower_components
logs
node_modules
public
以上四个目录不要提交！以上四个目录不要提交！以上四个目录不要提交！
重要的事情说三遍

------------------------------------------------------------------------------

先删除node_modules和bower_components，再在项目跟目录下运行如下命令，安装依赖

npm install grunt --save-dev
npm install grunt-bower-task --save-dev
npm install grunt-contrib-clean --save-dev
npm install grunt-contrib-copy --save-dev
npm install grunt-contrib-imagemin --save-dev
npm install grunt-contrib-jshint --save-dev
npm install grunt-contrib-less --save-dev
npm install grunt-contrib-jshint --save-dev
npm install grunt-contrib-watch --save-dev
npm install grunt-express-server --save-dev

npm install body-parser
npm install connect-redis
npm install cookie-parser
npm install debug
npm install express
npm install express-session
npm install jade
npm install lodash
npm install log4js
npm install redis
npm install request
npm install serve-favicon
npm install socket.io
npm install when

bower install jquery#1.11.3 --save
bower install bootstrap --save
bower install requirejs --save
bower install iCheck --save
bower install font-awesome --save
bower install jquery-validation --save
bower install jquery.cookie --save
bower install bootstrap-switch --save
bower install jquery-easing --save

安装完成后执行grunt命令启动项目
