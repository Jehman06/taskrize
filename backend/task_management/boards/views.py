from rest_framework import generics, status
from rest_framework.response import Response
from .models import Board
from .serializers import BoardSerializer

class BoardListView(generics.ListAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

class BoardDetailView(generics.RetrieveAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

class BoardCreateView(generics.CreateAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

class BoardUpdateView(generics.UpdateAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

class BoardDeleteView(generics.DestroyAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

# Favorite boards
class BoardFavoriteListView(generics.ListAPIView):
    serializer_class = BoardSerializer

    def get_queryset(self):
        user = self.request
        return user.favorite_boards.all()
    
class BoardFavoriteCreateView(generics.CreateAPIView):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer

    def post(self, request, *args, **kwargs):
        user = request.user
        board_id = request.data.get('board_id')

        try:
            board = Board.objects.get(pk=board_id)
        except Board.DoesNotExist:
            return Response({'error': 'Board not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Add the board to the user's favorite boards
        user.favorite_boards.add(board)
        user.save()

        return Response({'message': 'Board successfully added to favorites'}, status=status.HTTP_201_CREATED)