import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { spacesClient } from '../config/spaces.js';
import { env } from '../config/env.js';

export async function createUploadUrl(input: { artistId: string; filename: string; contentType: string }) {
  const key = `artists/${input.artistId}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${input.filename}`;
  const command = new PutObjectCommand({
    Bucket: env.SPACES_BUCKET,
    Key: key,
    ContentType: input.contentType
  });
  const uploadUrl = await getSignedUrl(spacesClient, command, { expiresIn: 900 });

  return { uploadUrl, key, publicUrl: `${env.SPACES_CDN_BASE_URL}/${key}` };
}
