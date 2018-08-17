let Mam = require('../lib/mam.node.js');
let fs = require('fs');
let IOTA = require('iota.lib.js');
let iota = new IOTA({ provider: `https://nodes.testnet.iota.org` });

// Init State
// INSERT THE ROOT IN HERE!
let root = 'FWLYSNBLWTTAZS9MXZEUMDPRUMTJWXBZEVIBFUS9MVKOANQIZQHEIFXRLJYOXTGQLKREAWRFMTEZ9ASPV';

// Initialise MAM State
let mamState = Mam.init(iota);

let side_key = fs.readFileSync('../side_key.txt','utf8');

// Publish to tangle
const publish = async packet =>
{
    let trytes = iota.utils.toTrytes(JSON.stringify(packet));
    let message = Mam.create(mamState, trytes);
    mamState = message.state;
    await Mam.attach(message.payload, message.address);
    return message.root
};

// let dataOut = [];
// // Callback used to pass data out of the fetch
// const logData = data => dataOut.push(JSON.parse(iota.utils.fromTrytes(data)));
//
// const execute = async () =>
// {
//     let resp = await Mam.fetch(root, 'restricted', side_key, logData);
//     console.log(resp);
//     console.log(dataOut[dataOut.length-1]);
// };
let dataOutput =[];
// Callback used to pass data out of the fetch
const logData = data => dataOutput.push(JSON.parse(iota.utils.fromTrytes(data)));

const execute = async () =>
{
    //Before write the dat clear the file and add header
    fs.writeFile('data_received_RTT', '', function(err) {
        if (err)
        {
            return console.log(err);
        }
    });
    fs.appendFile('data_received_RTT', 'message_num,time_send,time_received' +'\n', function(err) {
        if (err)
        {
            return console.log(err);
        }
    });

    let resp = await Mam.fetch(root, 'restricted', side_key, logData);
    dataOutput.forEach(function (data) {
        console.log(data+','+Date.now());
        //For RTT (Round trip time - Service time)
        //=======================
        fs.appendFile('data_received_RTT', data+','+Date.now()+'\n', function(err) {
            if(err) {
                return console.log(err);
            }
        });
    });
    console.log(resp);
};

execute();
