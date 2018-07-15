let Mam = require('./lib/mam.node.js');
let fs = require('fs');
let IOTA = require('iota.lib.js');
let iota = new IOTA({ provider: `https://field.carriota.com:443` });

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
// Callback used to pass data out of the fetch
const logData = data => console.log(JSON.parse(iota.utils.fromTrytes(data)));

const execute = async () =>
{
    let resp = await Mam.fetch(root, 'restricted', side_key, logData);
    console.log(resp)
};

execute();