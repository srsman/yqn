/**
 * Created by ayou on 2016-03-30.
 */
var uploaderJava = module.exports = {},
  formidable = require('formidable'),
  request = require("request"),
  fs = require('fs'),
  serverConfig = require('../server_config'),
  qiniuEnv = process.env.NODE_ENV; // 当前的项目环境
  imgUpload = serverConfig.env[qiniuEnv].target.h5 + '/common_api/upload_image'; // 图片上传

// 上传进度
uploaderJava.progress = {};
// 返回参数
uploaderJava.response = {
  'success': {
    'code': 0,
    'message': 'success',
    'result': ''
  },
  'error': {
    'code': 800,
    'message': '上传图片失败'
  }
};

/**
 * 图片上传，调用java接口
 * @param req
 * @param res
 * @param tmpDir 临时目录
 */
uploaderJava.upload = function(req,res,tmpDir) {
  var form = new formidable.IncomingForm();
  form.uploadDir = tmpDir;
  form.parse(req, function (err, fields, files) {
    var file = files.file;
    if (err) {
      res.send(uploaderJava.response.error);
    } else {
      var uploadedPath = file.path;
      // 上传参数配置
      var formData = {
        file: {
          value: fs.createReadStream(uploadedPath),
          options: {
            filename: file.name,
            contentType: file.type
          }
        }
      };
      var options = {
        url: imgUpload,
        cert: fs.readFileSync('./ssl/certificate.pem'),
        key: fs.readFileSync('./ssl/privatekey.pem'),
        formData:formData
      };
      // 上传图片到java后台
      request.post(options,function optionalCallback(err, httpResponse, body) {
        if(!err && httpResponse.statusCode === 200) {
          var bodyObj = JSON.parse(body);
          if(bodyObj.code ===  0) {
            uploaderJava.response.success.result = bodyObj.result.urls;
            res.send(uploaderJava.response.success);
          } else {
            uploaderJava.response.error.code = bodyObj.code;
            uploaderJava.response.error.message = bodyObj.message;
            res.send(uploaderJava.response.error);
          }
        } else {
          res.send(uploaderJava.response.error);
        }
        // 删除临时文件
        fs.unlink(uploadedPath);
      });
    }
  });
  //文件上传中事件
  //form.on("progress", function (bytesReceived, bytesExpected) {
  //  // 百分比
  //  uploaderJava.progress[req.session.linkToken] = Math.round(bytesReceived / bytesExpected * 100);
  //});
};

// 2
//uploaderJava.upload = function (req, res) {
//
//
//  var form = new formidable.IncomingForm();
//  form.uploadDir = './tmp';
//  form.parse(req, function (err, fields, files) {
//    //var param = {
//    //  'params': {
//    //    'sessionId': req.sessionID,
//    //    'fileName': files.file.name,
//    //    'fileData': files.file.path
//    //  }
//    //};
//    //transdata.post({
//    //  req:param,
//    //  url:api,
//    //  success:function(data){
//    //    res.send(data);
//    //  },
//    //  error:function(e){
//    //    res.send(e);
//    //  }
//    //});
//    upload(res,'./tmp/test.jpg','test.jpg');
//    //var param = {
//    //  'params': {
//    //    'sessionId': req.sessionID,
//    //    'fileName': files.file.name,
//    //    'fileData': files.file.path
//    //  }
//    //
//    //};
//    ////res.send(param);
//    //ajax.post(api, {
//    //  body: param
//    //}).then(function (data) {
//    //  res.send(data);
//    //}, function (data) {
//    //  res.send(data);
//    //});
//  });
//
//  //ajax.post(api,{
//  //  body: req.body
//  //}).then(function(data) {
//  //  res.send(data);
//  //},function(data) {
//  //  res.send(data);
//  //});
//};
//
//
//function upload(_res,path,filename) {
//
//  var boundaryKey = '----' + new Date().getTime();
//
//  var options = {
//    //https://devweb.yiqiniu.com:9003/common_api/upload_image
//    host: '192.168.1.19',
//
//    port: 80,//远端服务器端口号
//
//    method: 'POST',
//
//    path: '/common_api/upload_image',//上传服务路径
//
//    //key: fs.readFileSync('./ssl/privatekey.pem'),
//    //cert: fs.readFileSync('./ssl/certificate.pem'),
//    headers: {
//
//      'Content-Type': 'multipart/form-data; boundary=' + boundaryKey,
//
//      'Connection': 'keep-alive'
//
//    }
//
//  };
//
//  var req = http.request(options, function (res) {
//    var data = '';
//
//    res.setEncoding('utf8');
//
//    res.on('data', function (chunk) {
//
//      data += chunk;
//
//    });
//
//    res.on('end', function () {
//
//      _res.send(data);
//
//    });
//
//  });
//
//  req.write(
//    '–-' + boundaryKey + '\r\n' +
//    'Content-Disposition: form-data; name="file"; filename="test.jpg"\r\n' +
//    'Content-Type: image/jpeg\r\n\r\n'
//  );
//
// //设置1M的缓冲区
//  var fileStream = fs.createReadStream('./tmp/test.jpg', {bufferSize: 1024 * 1024});
//  fileStream.pipe(req, {end: false});
//  fileStream.on('end', function () {
//    req.end('\r\n--' + boundaryKey + '--');
//  });
//}