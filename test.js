const fs = require('fs');
const path = require('path');
const { Client, Server, UploadFilesCommand } = require('nextcloud-node-client');
const config = require('./config.json'); // Ensure this path is correct

const server = new Server({
    basicAuth: {
        password: config.nextcloudPassword,
        username: config.nextcloudUsername,
    },
    url: config.nextcloudUrl,
});
const client = new Client(server);

async function uploadToNextcloud(fileBuffer, remoteFilePath, fileName) {
    try {
        console.log('Uploading to Nextcloud:', remoteFilePath);

        const tempFilePath = path.join(__dirname, 'tmp', fileName);
        if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
            fs.mkdirSync(path.join(__dirname, 'tmp'));
        }
        fs.writeFileSync(tempFilePath, fileBuffer);

        const files = [
            {
                sourceFileName: tempFilePath,
                targetFileName: remoteFilePath
            },
        ];

        const uc = new UploadFilesCommand(client, { files });
        await uc.execute();

        console.log(`File uploaded to Nextcloud: ${remoteFilePath}`);
        await delay(2000);

        const file = await client.getFile(remoteFilePath);
        const createShare = { fileSystemElement: file };
        const share = await client.createShare(createShare);
        const streamlink = share.url + "/download/" + fileName;
        console.log(streamlink);

        fs.unlinkSync(tempFilePath); // Clean up the temporary file

        return streamlink;
    } catch (error) {
        console.error(`Error uploading to Nextcloud: ${error}`);
        throw error;
    }
}

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sample usage
(async () => {
    try {
        const filePath = 'C:\\Users\\User\\Desktop\\ATOM-V450_wr_01a.jpg'; // Provide the path to your local image file
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const remoteFilePath = `/uploads/${fileName}`;
        const downloadLink = await uploadToNextcloud(fileBuffer, remoteFilePath, fileName);
        console.log('Download Link:', downloadLink);
    } catch (error) {
        console.error('Error:', error);
    }
})();
