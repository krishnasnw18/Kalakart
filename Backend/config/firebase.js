const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");

const localKeyPath = require("path").join(
    __dirname,
    "..",
    "serviceAccountKey.json"
);

const renderKeyPath = "/etc/secrets/serviceAccountKey.json";

let serviceAccount;

if (fs.existsSync(renderKeyPath)) {
    serviceAccount = require(renderKeyPath);
} else {
    serviceAccount = require(localKeyPath);
}

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = { db };