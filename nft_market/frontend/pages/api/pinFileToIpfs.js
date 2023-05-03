// Before using this API endpoint, make sure to run npm install FormData formidable or yarn install FormData formidable.
import axios from 'axios';
import FormData from 'form-data';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const data = await new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject({ err });
      resolve({ files });
    });
  });

  const image = data.files.image;
  if (!image) {
    res.status(403).send({
      message: "No image uploaded",
    });
  }

  const formData = new FormData();

  const file = fs.createReadStream(image.filepath);
  formData.append('file', file);

  const metadata = JSON.stringify({ name: 'File name' });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({ cidVersion: 0 })
  formData.append('pinataOptions', options);

  try {
    const cid = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      }
    }).then(res => res.data.IpfsHash);

    res.status(200).send({
      fileURL: `https://gateway.pinata.cloud/ipfs/${cid}`
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "something went wrong, check the log in your terminal",
    });
  }
}