const express = require('express');
const router = express.Router();
const comDoc = require('./models/community');
const Res = require('./models/Res');

const DOC_NUMBERS = 10;

/**
 * 
 * template method 아이디어
 * 
 * let db_res;
 * mongodb.function((err,db_data)=>{
 *  ...
 *  db_res = db_data
 * })
 * 
 * if(db_res)
 * res.status(200).send(db_res)
 */

//yet useless dir
router.get('/', (req, res) => {
    res.send('communityDocQuery works!');
})


router.get('/loadFirstDocList', loadFirstDocList);

router.get('/loadNextDocList', loadNextDocList);

router.get('/loadPriorDocList', (req, res) => {
    let bundle = req.body;
    let cur_idx = bundle.cur_idx - DOC_NUMBERS;//다음 문서 리스트 idx

    comDoc.find({}).skip(cur_idx).limit(cur_idx + DOC_NUMBERS).exec((err, doc_res) => {
        if (err)
            console.log("/loadFirstDocList failed");
        else {
            debug(new Res(true, "/loadFirstDocList ok", { data: doc_res, idx: cur_idx }))
            // res.json(new Res(true,"/loadFirstDocList ok",{data : doc_res, idx : cur_idx}));
        }
    })
})

async function loadFirstDocList() {

    testHook = function () {
        return new Promise(r => {
            comDoc.find({}).limit(DOC_NUMBERS).exec((err, res) => {
                if (err)
                    console.log("/loadFirstDocList failed");
                else {
                    r(new Res(true, "/loadFirstDocList ok", res))
                }
            })

        })
    }

    return await template(testHook, true);
}

function loadNextDocList(req, res) {
    let bundle = req.body;
    let start_idx = bundle.cur_idx + DOC_NUMBERS;//다음 문서 리스트 idx

    testHook = function (){
        return new Promise(r => {

            comDoc.find({}).skip(start_idx).limit(DOC_NUMBERS).exec((err, doc_res) => {
                if (err)
                console.log("/loadFirstDocList failed");
                else {
                    // debug(new Res(true, "/loadFirstDocList ok", { data: doc_res, idx: start_idx }))
                    r( new Res(true, "/loadFirstDocList ok", { data: doc_res, idx: start_idx }) );
                    // res.json(new Res(true,"/loadFirstDocList ok",{data : doc_res, idx :start_idx}));
                }
            })
        })
    }

    return template(testHook, true);
}


async function writeNewDoc(req, res) {
    let bundle = req.body;
    // console.log("writeNewDoc : ", bundle);
    let user = bundle.user;
    let content = bundle.content;
    let time = new Date();

    let data = {
        user: user,
        content: content,
        year: time.getFullYear(),
        month: time.getMonth(),
        date: time.getDate(),
        hour: time.getHours(),
        min: time.getMinutes(),
        time: time
    }
    newComDoc = new comDoc(data);


    /**
     * real working operation
     */
    // newComDoc.save((err, data) => {
    //     if (err)
    //         console.log("error occured! : ", err);
    //     else {
    //         // console.log("data saved!");
    //         // debug(new Res(true,"writeNewDoc ok"))
    //         res.status(200).send(new Res(true,"writeNewDoc ok"));
    //     }
    // })

    /**
     * test operation
     */
    // return new Promise((resolve) => {
    //     newComDoc.save((err, data) => {
    //         if (err)
    //             console.log("error occured! : ", err);
    //         else {
    //             // console.log("data saved!");
    //             // debug(new Res(true,"writeNewDoc ok"))
    //             resolve(new Res(true, "writeNewDoc ok"))
    //         }
    //     })
    // })
    testhook = function () {
        return new Promise(r => {
            newComDoc.save((err, data) => {
                if (err)
                    console.log("error occured! : ", err);
                else {
                    // console.log("data saved!");
                    r(new Res(true, "writeNewDoc ok"))
                }
            })
        })
    }

    realHook = function () {
        newComDoc.save((err, data) => {
            if (err)
                console.log("error occured! : ", err);
            else {
                res.status(200).send(new Res(true, "writeNewDoc ok"));
            }
        })
    }
    return await template(testhook, true);

}

/**
 * template method
 */
function template(hook, isTest) {
    /**
     * if test
     */
    if (isTest) {
        return new Promise(async (resolve) => {
            _res_ = await hook()
            resolve(_res_);

        })
    }

    /**
     * if real operation
     */
    else {
        hook();
    }
}

router.post('/writeNewDoc', writeNewDoc)

// exports.writeNewDoc = writeNewDoc;
module.exports = { writeNewDoc, loadFirstDocList, loadNextDocList, DOC_NUMBERS };