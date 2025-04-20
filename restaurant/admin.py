from django.contrib import admin
from .models import MenuItem, Table, Customer, Order, OrderItem, Employee

admin.site.register(MenuItem)
admin.site.register(Table)
admin.site.register(Customer)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Employee)
