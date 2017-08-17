var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var AWS = require('aws-sdk');
var fs = require('fs');
AWS.config.region = 'ap-northeast-2';
var s3 = new AWS.S3();
var gm = require('gm');

var SERVER_URL = "https://s3.ap-northeast-2.amazonaws.com/kusulang-article/";

router.get('/', function(req, res, next) {
    var params = {
        Bucket: 'kusulang-article',
        Delimiter: '/'
    };

    s3.listObjects(params).on('success', function handlePage(response) {
        var folders = [];

        for(var name in response.data.CommonPrefixes){
            var path = response.data.CommonPrefixes[name].Prefix;
            folders.push(path);
        }
        
        if (response.hasNextPage()) {
            response.nextPage().on('success', handlePage).send();
        } else {
            res.render('admin/article/article_list', { folders:folders });
            res.end('end');
        }
    }).send();
});

router.get('/:article_name', function(req, res, next) {
    var article_name = req.params.article_name;

    var params = {
        Bucket: 'kusulang-article',
        Prefix: article_name + '/'
    };

    s3.listObjects(params).on('success', function handlePage(response) {
        for(var name in response.data.Contents){
            res.write(response.data.Contents[name].Key + "<br>");
        }

        if (response.hasNextPage()) {
            response.nextPage().on('success', handlePage).send();
        } else {
            res.end('end');
        }
    }).send();
});

// router.get('/:store_id/image', function(req, res, next) {
//     var store_id = req.params.store_id;
//
//     res.render('admin/store/image', {
//         title: 'Upload Images',
//         post_url: '/admin/store/' + store_id + '/image'
//     });
// });
//
// router.post('/:store_id/image', upload.array('image', 2), function(req, res, next) {
//     var store_id = req.params.store_id;
//     var file_name = req.files[0].filename;
//     var directory = req.files[0].destination;
//     var ext = req.files[0].originalname.split(".");
//     ext = ext[ext.length - 1];
//
//     res.write('store_id is ' + store_id + '<br>');
//     res.write('file_name is ' + file_name + '<br>');
//     res.write('directory is ' + directory + '<br>');
//     res.end('ext is ' + ext + '<br>');
// });
/*
router.post('/:store_id', upload.array('image', 2), function(req, res, next) {
    try {
        var store_id = req.params.store_id;
        var file_name = req.files[0].filename;
        var directory = req.files[0].destination;
        var ext = req.files[0].originalname.split(".");
        ext = ext[ext.length - 1];

        fs.renameSync(directory + file_name, directory + file_name + "." + ext);
        file_name = file_name + "." + ext;

        var path = directory + file_name;

        gm(path).resize(1600, 1600)
                .write(path, function (err) {
                    var param = {
                        'Bucket':'kusulang-storeimage',
                        'Key': store_id + "/" + file_name,
                        'ACL':'public-read',
                        'Body':fs.createReadStream(path),
                        'ContentType':'image/' + ext
                    }

                    s3.upload(param, function(err, data) {
                        gm(path).resize(400, 400, "^")
                                .write(path, function (err) {
                                    var param = {
                                        'Bucket':'kusulang-storeimage',
                                        'Key': store_id + "/thumb/" + file_name,
                                        'ACL':'public-read',
                                        'Body':fs.createReadStream(path),
                                        'ContentType':'image/' + ext
                                    }

                                    s3.upload(param, function(err, data) {
                                        fs.unlink(path);
                                        var json = {}
                                        json["res"] = 1;
                                        json["msg"] = "success";
                                        json["url"] = data.Location;
                                        res.status(200).json(json);
                                    });
                                });
                    });
                });

        // console.log(store_id);
        // console.log(file_name);
        // console.log(directory);
        // console.log(ext);
        // console.log(req.body); //form fields
        // console.log(req.file); //form files
        // console.log(req.files); //form files
    } catch (exception) {
        var msg = '';
        for (var i in exception) {
             msg += i + ' : ' + exception[i] + '\n';
        }

        var json = {}
        json["res"] = 0;
        json["msg"] = msg;
        res.status(200).json(json);
    }
});

router.get('/:file', function (req, res){
    file = req.params.file;
    var img = fs.readFileSync("uploads/" + file);
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(img, 'binary');
});
*/
module.exports = router;
