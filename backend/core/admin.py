from django.contrib import admin
from .models import *
from django_celery_beat.models import PeriodicTask, IntervalSchedule

admin.site.register(User)
admin.site.register(Connection)
admin.site.register(Category)
admin.site.register(Skill)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title','id', 'client', 'domain', 'status']
    filter_horizontal = ('skills_required',)

admin.site.register(Project, ProjectAdmin)

admin.site.register(Task)
admin.site.register(Payment)
admin.site.register(UserFeedback)
admin.site.register(Notification)
admin.site.register(Bid_By_Freelancer)
