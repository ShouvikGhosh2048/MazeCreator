from django.http import HttpResponseForbidden, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404, render,redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.views.generic import DetailView, ListView, DeleteView
from django.contrib.auth.models import User
from django.urls import reverse_lazy
from django.http.response import JsonResponse

from .forms import MazeForm
from .models import Maze, MazeRating, Bookmark

# Create your views here.
def home(request):
    return render(request, "main_app/home.html")

#Refer to Corey Schafer's Django tutorial.
def signup(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
    else:
        form = UserCreationForm()
    return render(request,"registration/signup.html",{
        "form": form,
    })

@login_required
def create_maze(request):
    if request.method == "POST":
        form = MazeForm(request.POST)
        if form.is_valid():
            maze = form.save(commit=False)
            maze.creator = request.user
            maze.save()
            return redirect(maze)
        else:
            return render(request,"main_app/maze_form.html",{
                "title": "",
                "time": "",
                "grid": "",
                "error":True,
                "create":True,
            })
    return render(request,"main_app/maze_form.html",{
            "title": "",
            "time": "",
            "grid": "",
            "create": True,
    })

@login_required
def update_maze(request,pk):
    maze = get_object_or_404(Maze,id=pk)
    if request.user != maze.creator:
        return HttpResponseForbidden() 
    if request.method == "POST":
        form = MazeForm(request.POST)
        if form.is_valid():
            maze.title = form.cleaned_data["title"]
            maze.time = form.cleaned_data["time"]
            maze.grid = form.cleaned_data["grid"]
            maze.save()
            return redirect(maze)
        else:
            return render(request,"main_app/maze_form.html",{
                "title": form.data["title"],
                "time": form.data["time"],
                "grid": form.data["grid"],
                "error": True,
                "create": False,
            })
    return render(request,"main_app/maze_form.html",{
        "title": maze.title,
        "time": maze.time,
        "grid": maze.grid,
        "create": False,
    })

def play_maze(request,pk):
    maze = get_object_or_404(Maze,id=pk)
    if not (maze.public or maze.creator == request.user or (request.user.has_perm('main_app.moderate_maze') and maze.requested_publish)):
        return HttpResponseForbidden()
    return render(request,"main_app/play_maze.html",{
        "maze":maze,
    })

class MazeDetailView(DetailView):
    model = Maze

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        maze = self.get_object()

        ratings = [rating.rating for rating in list(MazeRating.objects.filter(maze = maze))]
        if len(ratings) > 0:
            value = sum(ratings)/len(ratings)
            if value == int(value):
                value = int(value)
            else:
                value = int(value * 100)/100
            context_data["average_rating"] = value

        if self.request.user.is_authenticated:
            bookmarked = Bookmark.objects.filter(maze = maze, user = self.request.user).count() > 0
            context_data["bookmark"] = bookmarked

            if self.request.user == maze.creator:
                context_data["creator"] = True
            else:
                context_data["authenticated_non_creator"] = True
                
                context_data["stars_range"] = [[i,False] for i in range(1,6)]
                
                try:
                    rating = MazeRating.objects.get(maze = maze, user = self.request.user)
                    for i in range(rating.rating):
                        context_data["stars_range"][i][1] = True
                except:
                    pass
        if self.request.user.has_perm("main_app.moderate_maze"):
            if not maze.creator == self.request.user and (maze.public or maze.requested_publish):
                context_data["maze_moderator_controls"] = True
        return context_data

    def get(self, request, *args, **kwargs):
        maze = self.get_object()
        if not (maze.public or maze.creator == request.user or (request.user.has_perm('main_app.moderate_maze') and maze.requested_publish)):
            return HttpResponseForbidden() 
        return super().get(request, *args, **kwargs)
        
    def post(self,request,*args,**kwargs):
        maze = self.get_object()
        if not (maze.public or  maze.creator == request.user or (request.user.has_perm('main_app.moderate_maze') and maze.requested_publish)):
            return HttpResponseForbidden() 
        if not request.user.is_authenticated:
            return HttpResponseForbidden() 
        if "bookmark" in request.POST:
            new_bookmarked_value = request.POST["bookmark"] == "true"
            response = JsonResponse({ "bookmark" : new_bookmarked_value})

            if new_bookmarked_value:
                Bookmark.objects.get_or_create(
                    maze = maze,
                    user = request.user,
                )
            else:
                Bookmark.objects.filter(maze = maze, user = request.user).delete()

            return response
            
        elif "rating" in request.POST:
            if request.user == maze.creator:
                return HttpResponseForbidden()
            try:
                rating_value = int(request.POST["rating"])
                if rating_value < 1 or rating_value > 5:
                    return JsonResponse({})
            except:
                return JsonResponse({})
            user = request.user
            rating = MazeRating.objects.get_or_create(
                maze = maze,
                user = user,
            )[0]
            rating.rating = rating_value
            rating.save()
            ratings = list(MazeRating.objects.filter(maze=maze).all())
            ratings = [rating.rating for rating in ratings]
            avg_rating = sum(ratings)/len(ratings)
            if int(avg_rating) == avg_rating:
                avg_rating = int(avg_rating)
            else:
                avg_rating = int(avg_rating * 100)/100
            return JsonResponse ({
                "rating_value": rating_value,
                "average_rating": avg_rating,
            })
        
        elif "set_public" in request.POST:
            public = request.POST["set_public"] == "true"

            moderator_valid = request.user.has_perm("main_app.moderate_maze") and (maze.requested_publish or not public)
            creator_valid = maze.creator == request.user and not public

            if not moderator_valid and not creator_valid:
                return HttpResponseForbidden()
            
            maze.public = public
            maze.requested_publish = False
            maze.save()
            return JsonResponse({"set_public": public})

        elif "set_requested_publish" in request.POST:

            if maze.creator != request.user:
                return HttpResponseForbidden()

            requested_publish = request.POST["set_requested_publish"] == "true"

            maze.requested_publish = requested_publish
            maze.save()
            
            return JsonResponse({"requested_publish":requested_publish})

        return JsonResponse({})

class MazeListView(ListView):
    model = Maze

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.has_perm("main_app.moderate_maze"):
            queryset = queryset.filter(public=True)
        else:
            if "requested_publish" in self.request.GET and self.request.GET["requested_publish"] == "on":
                queryset = queryset.filter(requested_publish=True)
            else:
                queryset = queryset.filter(public=True)
        if "title" in self.request.GET:
            queryset = queryset.filter(title__icontains = self.request.GET["title"])
        return queryset

    def get_context_data(self, **kwargs):
        context_data = super().get_context_data(**kwargs)
        context_data["search_title"] = self.request.GET.get("title","")
        context_data["requested_publish"] = "requested_publish" in self.request.GET and self.request.GET["requested_publish"] == "on"
        context_data["user_is_moderator"] = self.request.user.has_perm("main_app.moderate_maze")
        return context_data

class MazeDeleteView(DeleteView):
    model = Maze
    success_url = reverse_lazy('profile')

def view_user(request,pk):
    user_to_view = get_object_or_404(User,id = pk)
    creations = Maze.objects.filter(creator = user_to_view).filter(public=True)
    return render(request,"main_app/user_detail.html", {
        "user_to_view": user_to_view,
        "creations": creations,
    })

@login_required
def profile(request):
    bookmarks = Bookmark.objects.filter(user = request.user).all()
    bookmarks = [bookmark.maze for bookmark in bookmarks]

    creations = Maze.objects.filter(creator = request.user).all()
    return render(request,"main_app/profile.html", {
        "bookmarks": bookmarks,
        "creations": creations,
    })

def wiki(request):
    return render(request,"main_app/wiki.html")