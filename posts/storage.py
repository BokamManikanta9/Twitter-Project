from cloudinary_storage.storage import MediaCloudinaryStorage, VideoMediaCloudinaryStorage


class ImageStorage(MediaCloudinaryStorage):
    folder = "posts/images"


class VideoStorage(VideoMediaCloudinaryStorage):
    folder = "posts/videos"