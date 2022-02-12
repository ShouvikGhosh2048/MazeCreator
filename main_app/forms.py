from django.forms import ModelForm
from .models import Maze

class MazeForm(ModelForm):
    class Meta:
        model = Maze
        fields = ["title","time","grid"]