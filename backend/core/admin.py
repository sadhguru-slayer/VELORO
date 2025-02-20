from django.contrib import admin
from .models import User, Connection, Category, Skill, Project, Task, Payment

admin.site.register(User)
admin.site.register(Connection)
admin.site.register(Category)
admin.site.register(Skill)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(Payment)
