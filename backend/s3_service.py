import boto3
from botocore.exceptions import ClientError
from typing import Optional, BinaryIO
from config import settings
import uuid
import mimetypes
from urllib.parse import quote

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
    
    def generate_file_key(self, filename: str, day_number: Optional[int] = None) -> str:
        """Generate a unique S3 object key for a file."""
        file_id = str(uuid.uuid4())
        
        # Get file extension
        _, ext = mimetypes.guess_extension(filename) or ('', '')
        if not ext and '.' in filename:
            ext = '.' + filename.split('.')[-1].lower()
        
        # Organize by day if specified
        if day_number:
            return f"days/day-{day_number:02d}/{file_id}{ext}"
        else:
            return f"general/{file_id}{ext}"
    
    def upload_file(
        self, 
        file_content: BinaryIO, 
        filename: str, 
        content_type: str,
        day_number: Optional[int] = None
    ) -> tuple[str, str]:
        """
        Upload a file to S3 and return the file key and public URL.
        
        Args:
            file_content: File content as binary stream
            filename: Original filename
            content_type: MIME type of the file
            day_number: Optional day number for organization
        
        Returns:
            Tuple of (file_key, public_url)
        """
        try:
            # Generate unique file key
            file_key = self.generate_file_key(filename, day_number)
            
            # Upload to S3
            self.s3_client.upload_fileobj(
                file_content,
                self.bucket_name,
                file_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'ContentDisposition': f'inline; filename="{quote(filename)}"',
                    'CacheControl': 'max-age=31536000'  # 1 year cache
                }
            )
            
            # Generate public URL
            public_url = self.get_public_url(file_key)
            
            return file_key, public_url
            
        except ClientError as e:
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    
    def get_public_url(self, file_key: str) -> str:
        """Generate public URL for an S3 object."""
        return f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{file_key}"
    
    def get_presigned_url(self, file_key: str, expiration: int = 3600) -> str:
        """Generate a presigned URL for temporary access to a private object."""
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': file_key},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")
    
    def delete_file(self, file_key: str) -> bool:
        """Delete a file from S3."""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_key)
            return True
        except ClientError as e:
            print(f"Failed to delete file from S3: {str(e)}")
            return False
    
    def file_exists(self, file_key: str) -> bool:
        """Check if a file exists in S3."""
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=file_key)
            return True
        except ClientError:
            return False
    
    def get_file_metadata(self, file_key: str) -> Optional[dict]:
        """Get metadata for a file in S3."""
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=file_key)
            return {
                'size': response.get('ContentLength', 0),
                'content_type': response.get('ContentType', ''),
                'last_modified': response.get('LastModified'),
                'etag': response.get('ETag', '').strip('"')
            }
        except ClientError:
            return None

# Create a singleton instance
s3_service = S3Service() 