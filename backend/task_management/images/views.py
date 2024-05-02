from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from images.models import Image
from boards.serializers import ImageSerializer

# Create image
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def create_image(request):
    # Get the data from the request
    url = request.data.get('url')
    owner = request.data.get('owner')
    alt = request.data.get('alt')

    try:
        # Create the image
        image = Image.objects.create(url=url, owner=owner, alt=alt)
        serializer = ImageSerializer(image)
        return Response({'image': serializer.data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
# Get the first 8 images images
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_sample_images(request):
    # Get the first 8 images
    images = Image.objects.all()[:8]

    # Serialize the images
    serializer = ImageSerializer(images, many=True)
    return Response({'images': serializer.data}, status=status.HTTP_200_OK)

# Get all images
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_all_images(request):
    images = Image.objects.all()
    serializer = ImageSerializer(images, many=True)
    return Response({'images': serializer.data}, status=status.HTTP_200_OK)