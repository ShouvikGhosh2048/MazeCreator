from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator,MaxValueValidator
from .maze_validator import gridValidator

from django.urls import reverse

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User,on_delete = models.CASCADE)
    joining_date = models.DateField(auto_now_add=True)

    def get_absolute_url(self):
        return reverse('user', kwargs = { "pk": self.user.id })

class Maze(models.Model):
    class Meta:
        permissions = [("moderate_maze","Can moderate mazes.")]
    title = models.CharField(max_length=150)
    #https://stackoverflow.com/a/12026867 - Use validators to restrict model fields.
    time = models.PositiveSmallIntegerField(validators=[MinValueValidator(1),MaxValueValidator(99)])
    grid = models.TextField(validators=[gridValidator])

    creator = models.ForeignKey(User,on_delete = models.CASCADE)
    creation_date = models.DateField(auto_now_add=True)

    public = models.BooleanField(default=False)
    requested_publish = models.BooleanField(default=False)

    def get_absolute_url(self):
        return reverse("maze",kwargs={"pk": self.id})

class MazeRating(models.Model):
    class Meta:
        constraints = [ 
            models.UniqueConstraint(fields=["maze","user"], name="unique_rating_constraint")
        ]
    maze = models.ForeignKey(Maze,on_delete = models.CASCADE)
    user = models.ForeignKey(User,on_delete = models.CASCADE)

    RATING_CHOICES = [(i + 1,i + 1) for i in range(5)]
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES,null=True)

class Bookmark(models.Model):
    class Meta:
        constraints = [ 
            models.UniqueConstraint(fields=["maze","user"], name="unique_bookmark_constraint")
        ]
    
    maze = models.ForeignKey(Maze,on_delete = models.CASCADE)
    user = models.ForeignKey(User,on_delete = models.CASCADE)