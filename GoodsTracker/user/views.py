from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model

User = get_user_model()

@login_required(login_url='/log_in/')
def users_list(request):
    """
    NOTE: This is fine for demonstration purposes, but this should be
    refactored before we deploy this app to production.
    Imagine how 100,000 users logging in and out of our app would affect
    the performance of this code!
    """
    users = User.objects.select_related('logged_in_user')
    for user in users:
        user.status = 'Online' if hasattr(user, 'logged_in_user') else 'Offline'
    return render(request, 'user/user_list.html', {'users': users})
