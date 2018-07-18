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
async function publish(packet)
{
    let trytes = iota.utils.toTrytes(JSON.stringify(packet));
    let message = Mam.create(mamState, trytes);
    mamState = message.state;
    await Mam.attach(message.payload, message.address);
    return message.root;
}

let dataOutput =[];
// Callback used to pass data out of the fetch
const logData = data => dataOutput.push(JSON.parse(iota.utils.fromTrytes(data)));

const execute = async () =>
{
    //Before write the dat clear the file and add header
    // fs.writeFile('data_received', '', function(err) {
    //     if (err)
    //     {
    //         return console.log(err);
    //     }
    // });
    // fs.appendFile('data_received', 'time_received,message_num' +'\n', function(err) {
    //     if (err)
    //     {
    //         return console.log(err);
    //     }
    // });

    let resp = await Mam.fetch(root, 'restricted', side_key, logData);
    dataOutput.forEach(function (data) {
        console.log(data);
        publish(data+' '+Date.now());
    });
    console.log(resp);
};

execute();