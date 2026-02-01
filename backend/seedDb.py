import os
import django
import random
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'community_project.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from feed.models import Post, Comment, KarmaLedger

def run_seed():
    print("🧹 Cleaning database...")
    User.objects.exclude(is_superuser=True).delete()
    Post.objects.all().delete()

    print("👥 Creating Users...")
    users = []
    for name in ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve']:
        u = User.objects.create_user(username=name, password='password123')
        users.append(u)

    print("📝 Creating Posts...")
    posts = []
    for i in range(5):
        p = Post.objects.create(
            author=random.choice(users),
            content=f"This is an interesting post number {i} about Django!"
        )
        posts.append(p)

    print("💬 Creating Comment Tree...")
    for p in posts:
        # Top level comments
        for _ in range(2):
            parent = Comment.objects.create(
                author=random.choice(users),
                post=p,
                content="This is a top-level comment."
            )
            # Nested Replies (The Tree)
            for _ in range(2):
                Comment.objects.create(
                    author=random.choice(users),
                    post=p,
                    parent=parent,
                    content="This is a nested reply!"
                )

    print("💎 Generating Karma (Likes)...")
    post_ctype = ContentType.objects.get_for_model(Post)
    comm_ctype = ContentType.objects.get_for_model(Comment)

    # Like all posts and comments randomly to fill leaderboard
    for u in users:
        # Like some posts
        for p in random.sample(posts, 3):
            KarmaLedger.objects.get_or_create(
                user=p.author,
                actor=u,
                points=5,
                content_type=post_ctype,
                object_id=p.id
            )
        # Like some comments
        all_comments = Comment.objects.all()
        for c in random.sample(list(all_comments), 5):
            KarmaLedger.objects.get_or_create(
                user=c.author,
                actor=u,
                points=1,
                content_type=comm_ctype,
                object_id=c.id
            )

    print("🚀 Seeding Complete!")

if __name__ == '__main__':
    run_seed()