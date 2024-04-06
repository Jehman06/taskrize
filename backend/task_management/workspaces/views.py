from rest_framework.decorators import api_view, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from workspaces.models import Workspace
from workspaces.serializers import WorkspaceSerializer

# Create a default Workspace when the user signs up for the first time
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def create_default_workspace(request):
    # Access the  authenticated user
    user = request.user
    # Check if a default workspace already exists for the user
    # Check if the user is a member of any workspace
    if Workspace.objects.filter(owner=user).exists() or Workspace.objects.filter(members=user).exists():
        return Response({'message': 'Default workspace already exists for the user'}, status=status.HTTP_400_BAD_REQUEST)
    # Create the default workspace instance with the  user as the owner
    default_workspace = Workspace.objects.create(name='My First Workspace', owner=user)
    # Add the  user as a member of the default workspace
    default_workspace.members.add(user)
    # Return a success response
    return Response({'message': 'Default workspace created successfully'}, status=status.HTTP_201_CREATED)

# Get the workspaces for the user
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
def get_workspaces(request):
    # Access the authenticated user
    user = request.user
    # Query the database for relevant workspaces
    # Include workspaces where the user is the owner or a member
    workspaces = Workspace.objects.filter(Q(owner=user) | Q(members=user))
    # Serialize the list of workspaces into JSON format, allowing multiple instances
    serializer = WorkspaceSerializer(workspaces, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Create a new workspace
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
def create_workspace(request):
    # Access the authenticated user
    user = request.user
    # Extract the data from the request paylaod
    data = request.data
    # Validate the data using the WorkspaceSerializer
    serializer = WorkspaceSerializer(data=data)
    if serializer.is_valid():
        # Create a new workspace instance associated with the user
        workspace = serializer.save(owner=user)
        return Response(WorkspaceSerializer(workspace).data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)