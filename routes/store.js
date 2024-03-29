var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var AWS = require('aws-sdk');
var fs = require('fs');
AWS.config.update({
  accessKeyId: "AKIAI5I5WQRQ7RG4JH4A",
  secretAccessKey: "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",
  region: "ap-northeast-2"
});
var s3 = new AWS.S3();
var gm = require('gm');

router.post('/:store_id', upload.array('image', 2), function(req, res, next) {
    console.log('1')
    try {
        var store_id = req.params.store_id;
        var file_name = req.files[0].filename;
        var directory = req.files[0].destination;
        var ext = req.files[0].originalname.split(".");
        ext = ext[ext.length - 1];
        console.log('2')

        fs.renameSync(directory + file_name, directory + file_name + "." + ext);
        file_name = file_name + "." + ext;
        console.log('3')

        var path = directory + file_name;

        gm(path).resize(2000, 2000, "^")
                .write(path, function (err) {
                    console.log('4')

                    var param = {
                        'Bucket':'kusulang-storeimage',
                        'Key': store_id + "/" + file_name,
                        'ACL':'public-read',
                        'Body':fs.createReadStream(path),
                        'ContentType':'image/' + ext
                    }

                    console.log('5')

                    s3.upload(param, function(err, data) {
                        console.log('5.5')
                        gm(path).resize(2000, 2000)
                                .write(path, function (err) {
                                    console.log('6')

                                    var param = {
                                        'Bucket':'kusulang-storeimage',
                                        'Key': store_id + "/thumb/" + file_name,
                                        'ACL':'public-read',
                                        'Body':fs.createReadStream(path),
                                        'ContentType':'image/' + ext
                                    }

                                    console.log('7')

                                    s3.upload(param, function(err, data) {
                                        console.log('8')

                                        fs.unlink(path);
                                        console.log('9')
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
        console.log(exception)

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
