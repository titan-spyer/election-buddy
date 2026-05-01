from django.db import models

class State(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class District(models.Model):
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('state', 'name')

    def __str__(self):
        return f"{self.name} ({self.state.name})"

class Constituency(models.Model):
    CONSTITUENCY_TYPES = [
        ('Assembly', 'Assembly'),
        ('Parliamentary', 'Parliamentary'),
    ]
    name = models.CharField(max_length=100)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='constituencies')
    constituency_type = models.CharField(max_length=20, choices=CONSTITUENCY_TYPES, default='Assembly')
    representative = models.CharField(max_length=200, blank=True, null=True)
    party = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.district.name})"

class TimelineEvent(models.Model):
    title = models.CharField(max_length=200)
    date = models.CharField(max_length=100)
    description = models.TextField()
    is_upcoming = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.title} ({self.date})"
