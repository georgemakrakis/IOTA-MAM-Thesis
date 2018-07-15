let Mam = require('./lib/mam.node.js');
let fs = require('fs');
let IOTA = require('iota.lib.js');
let iota = new IOTA({ provider: `https://nodes.testnet.iota.org` });

// Init State
// INSERT THE ROOT IN HERE!
let root = 'FXGHIMFGHCDLFDBGUAMXYPRSXBOM9LMLFJHJ9XZIPRRGC9NELQBFBXUJKGSPOCP9EKNYQOTBGICGLJSMY';

// Initialise MAM State
let mamState = Mam.init(iota);

let side_key = fs.readFileSync('side_key.txt','utf8');

// Publish to tangle
const publish = async packet =>
{
    let trytes = iota.utils.toTrytes(JSON.stringify(packet));
    let message = Mam.create(mamState, trytes);
    mamState = message.state;
    await Mam.attach(message.payload, message.address);
    return message.root
};

let dataOut = [];
let prevLength = 0;
// Callback used to pass data out of the fetch
const logData = data => dataOut.push(JSON.parse(iota.utils.fromTrytes(data)));

const execute = async () =>
{
    while(true)
    {
        dataOut = [];
        let resp = await Mam.fetch(root, 'restricted', side_key, logData);

        if(dataOut.length>prevLength)
        {
            prevLength = dataOut.length;
            console.log(dataOut[dataOut.length-1]+' time_received: '+ Date.now());
            //resp is the next root
            console.log(resp);
        }
    }
};

execute();