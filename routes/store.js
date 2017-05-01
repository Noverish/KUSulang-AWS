var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var AWS = require('aws-sdk');
var fs = require('fs');
AWS.config.region = 'ap-northeast-2';
var s3 = new AWS.S3();
var gm = require('gm');

router.post('/:store_id', upload.array('image', 2), function(req, res, next) {
    try {
        var store_id = req.params.store_id;
        var file_name = req.files[0].filename;
        var directory = req.files[0].destination;
        var originalname = req.files[0].originalname;
        var content_type = req.files[0].mimetype;
        var ext = req.files[0].originalname.split(".");
        ext = ext[ext.length - 1];

        // fs.renameSync(directory + file_name, directory + file_name + "." + ext);
        // file_name = file_name + "." + ext;

        var path = directory + file_name;

        gm(path).resize(2000, 2000)
                .write(path, function (err) {
                    var param = {
                        'Bucket':'kusulang-storeimage',
                        'Key': store_id + "/" + originalname,
                        'ACL':'public-read',
                        'Body':fs.createReadStream(path),
                        'ContentType': content_type
                    }

                    s3.upload(param, function(err, data) {
                        gm(path).resize(2000, 2000, "^")
                                .write(path, function (err) {
                                    var param = {
                                        'Bucket':'kusulang-storeimage',
                                        'Key': store_id + "/thumb/" + originalname,
                                        'ACL':'public-read',
                                        'Body':fs.createReadStream(path),
                                        'ContentType': content_type
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

module.exports = router;
