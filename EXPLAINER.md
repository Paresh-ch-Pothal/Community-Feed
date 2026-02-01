# 📑 Technical Explainer: Community Feed & Gamification

This document explains the design decisions, data structures, and performance improvements made in this project. It's a community feed with gamification features like karma points and a leaderboard.

---

## 1. The Tree: Nested Comment Modeling & Serialization

### **The Comment Model**
To allow threaded discussions, the `Comment` model uses a `ForeignKey` that points to itself. This lets each comment have replies that can also be comments.

```python
parent = models.ForeignKey(
    'self', 
    null=True, 
    blank=True, 
    related_name='replies', 
    on_delete=models.CASCADE
)
```


## 2. Optimizing Nested Comments (Solving the N+1 Problem)

A common problem with nested comments is that for each comment, we may end up making a separate database query to get its replies. This can cause performance issues.
To solve this, I used a more efficient approach:

1. Single Fetch: I use .select_related('author') to get all comments in one database query.
2. Dictionary Mapping: I map all comments into a Python dictionary where the key is the comment ID and the value is the comment data.
3. Assigning Parents: I then loop through all the comments and assign replies to their respective parent comment using this dictionary.
4. The Result: This reduces the database queries to just one, and the rest of the work happens in memory, making it much faster.


## 2. The Karma Ledger: Tracking Points
Why Not Just Use a Counter?
Instead of keeping a simple karma_points field in the user profile, I created a "Karma Ledger" system. This system keeps track of every time a user gets points, and we can see exactly how they earned those points.
Why This is Better:

1. Audit Trail: Every time a user earns points, it's like a transaction. We can track exactly which post or comment gave them points.
2. Data Integrity: If a post gets deleted or a like is removed, the ledger automatically keeps the total points correct.
3. Flexibility: Since each point is a transaction with a timestamp, we can easily calculate points for any time period (like the 24-hour leaderboard).


## 4. The 24h Leaderboard: Showing Top Users
The leaderboard is calculated by summing the points from the Karma Ledger for each user, but only for the past 24 hours.
How the Query Works:

```python
def leaderboard(request):
    # 1. Define the time window (last 24 hours)
    day_ago = timezone.now() - timedelta(hours=24)
    
    # 2. Get the users' points in the last 24 hours
    top_users = User.objects.filter(received_karma__created_at__gte=day_ago) \
                .annotate(day_karma=Sum('received_karma__points')) \
                .order_by('-day_karma')[:5]
    
    # 3. Prepare the data for the frontend
    data = [{'username': u.username, 'karma': u.day_karma} for u in top_users]
    return Response(data)
```

## 5. The AI's Suggestion: Refactoring the System
What the AI Suggested:
At first, the AI suggested adding a karma field directly to the User model and using Django signals to update it whenever a "Like" was created. This meant incrementing the karma points each time a user liked a post.
### The Problems with This Approach:
1. Race Conditions: If two users liked the same post at the same time, it could cause an issue where one like was lost.
2. Lack of Context: A simple karma counter doesn't help us figure out "How many points were earned in the last 24 hours?" without more complex queries.

### How I Fixed It:
1. I redesigned the system to use a "Karma Ledger" with Django ContentTypes.
2. Generic Foreign Keys: Instead of linking to just one model (like a post), the ledger can link to any model (post or comment) without hardcoded relationships.
3. Event-Based System: Instead of storing a total karma count, we calculate it based on events (like each time a user earns points). This makes the system accurate, and we can easily filter for things like the 24-hour leaderboard.
