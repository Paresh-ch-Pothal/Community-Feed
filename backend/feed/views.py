from django.utils import timezone
from datetime import timedelta
from django.db import transaction, IntegrityError
from django.db.models import Sum, Count, Exists, OuterRef
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from .models import Post, Comment, KarmaLedger
from .serializers import PostSerializer, UserSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')  # Required for router
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Optimize queryset with like status and comment counts"""
        queryset = Post.objects.all().order_by('-created_at')
        
        if self.request.user.is_authenticated:
            # Subquery to check if current user liked this post
            user_liked = KarmaLedger.objects.filter(
                actor=self.request.user,
                content_type=ContentType.objects.get_for_model(Post),
                object_id=OuterRef('pk')
            )
            
            queryset = queryset.annotate(
                is_liked=Exists(user_liked),
                like_count=Count('likes', distinct=True),
                comments_count=Count('comments', distinct=True)
            )
        else:
            queryset = queryset.annotate(
                like_count=Count('likes', distinct=True),
                comments_count=Count('comments', distinct=True)
            )
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        post = self.get_object()
        parent_id = request.data.get('parent_id')
        content = request.data.get('content')

        if not content:
            return Response({'error': 'Content is required'}, status=400)

        comment = Comment.objects.create(
            author=request.user,
            post=post,
            content=content,
            parent_id=parent_id
        )
        return Response({'status': 'comment added', 'id': comment.id}, status=201)

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        post = self.get_object()
        all_comments = Comment.objects.filter(post=post).select_related('author')
        
        # Get content type for comments
        comment_ctype = ContentType.objects.get_for_model(Comment)
        
        # Build mapping with like status for current user
        mapping = {}
        for c in all_comments:
            is_liked = False
            if request.user.is_authenticated:
                is_liked = KarmaLedger.objects.filter(
                    actor=request.user,
                    content_type=comment_ctype,
                    object_id=c.id
                ).exists()
            
            mapping[c.id] = {
                'id': c.id,
                'author': c.author.username,
                'content': c.content,
                'likes': c.likes.count(),
                'is_liked': is_liked,
                'created_at': c.created_at.isoformat(),
                'replies': []
            }
        
        # Build tree structure
        tree = []
        for c in all_comments:
            if c.parent_id:
                parent = mapping.get(c.parent_id)
                if parent:
                    parent['replies'].append(mapping[c.id])
            else:
                tree.append(mapping[c.id])
                
        return Response(tree)


@api_view(['POST'])
def toggle_like(request):
    target_id = request.data.get('id')
    target_type = request.data.get('type')  # 'post' or 'comment'
    
    if not target_id or not target_type:
        return Response({'error': 'Missing id or type'}, status=400)
    
    try:
        model = Post if target_type == 'post' else Comment
        obj = model.objects.get(id=target_id)
        ctype = ContentType.objects.get_for_model(model)
        
        with transaction.atomic():
            like = KarmaLedger.objects.filter(
                actor=request.user,
                content_type=ctype,
                object_id=target_id
            ).first()
            
            if like:
                like.delete()
                return Response({
                    'status': 'unliked',
                    'like_count': obj.likes.count()
                })
            
            pts = 5 if target_type == 'post' else 1
            try:
                KarmaLedger.objects.create(
                    user=obj.author,
                    actor=request.user,
                    points=pts,
                    content_type=ctype,
                    object_id=target_id
                )
                return Response({
                    'status': 'liked',
                    'like_count': obj.likes.count()
                })
            except IntegrityError:
                return Response({'status': 'already liked'}, status=400)
    
    except (Post.DoesNotExist, Comment.DoesNotExist):
        return Response({'error': 'Object not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    day_ago = timezone.now() - timedelta(hours=24)
    top_users = User.objects.filter(received_karma__created_at__gte=day_ago) \
                .annotate(day_karma=Sum('received_karma__points')) \
                .order_by('-day_karma')[:5]
    
    data = [{'username': u.username, 'karma': u.day_karma} for u in top_users]
    return Response(data)


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)