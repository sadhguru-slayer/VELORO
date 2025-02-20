from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(Connection)
admin.site.register(Category)
admin.site.register(Skill)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(Payment)
admin.site.register(UserFeedback)
