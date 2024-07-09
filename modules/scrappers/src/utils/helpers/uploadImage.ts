import { vehicleScrapingStatus } from '../../constants/constants';
import { ociConfig } from '../../config/config';
import AWS from 'aws-sdk';
const awsConfig: any = ociConfig;
AWS.config.update(awsConfig);

const s3 = new AWS.S3({ params: { Bucket: awsConfig.bucket } });

export const uploadImageToOci = async (url: string, pathUrl: string) => {
    const options = {
        url,
        encoding: null
    };

    try {
        const imageData = await fetchImageData(options);
        return await uploadOciImage(imageData, pathUrl);
    } catch (error) {
        throw error;
    }
}

// @desc upload image to bucket
const uploadOciImage = async (data: Buffer, pathUrl: string) => {
    const path = `${awsConfig.bucket}/${awsConfig.folder}/${pathUrl}`;
    const putObjectParams: any = {
        Bucket: awsConfig.bucket,
        Body: data,
        Key: path,
        ContentEncoding: 'base64',
        ContentType: 'image/png'
    };
    try {
        await s3.putObject(putObjectParams).promise();

        const urlParams = {
            Bucket: awsConfig.bucket,
            Key: path
        };

        const url = await getSignedUrl('getObject', urlParams);
        return url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

const getSignedUrl = async (operation: string, params: any) => {
    try {
        const url = await s3.getSignedUrlPromise(operation, params);
        return url;
    } catch (error) {
        throw error;
    }
};

const fetchImageData = async (options: any): Promise<Buffer> => {
    const response = await fetch(options.url);
    if (!response.ok) {
        throw new Error('Failed to fetch image data');
    }
    const buffer = await response.arrayBuffer();
    const imageData = Buffer.from(buffer);

    return imageData;
};

export const formatImageUrl = (imageUrl: any) => {
    if (imageUrl) {
        if (imageUrl.includes('?')){
           imageUrl = imageUrl.split('?')[0]
        }
    }
    return imageUrl
}