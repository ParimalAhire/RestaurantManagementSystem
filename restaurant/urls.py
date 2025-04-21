from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),

    # Customers
    path('customers/', views.customer_list, name='customers'),
    path('customers/add/', views.add_customer, name='add_customer'),
    path('customers/edit/<int:pk>/', views.edit_customer, name='edit_customer'), 
    path('customers/delete/<int:pk>/', views.delete_customer, name='delete_customer'), 

    # Tables
    path('tables/', views.tables, name='tables'),
    path('tables/add/', views.add_table, name='add_table'),
    path('tables/edit/<int:pk>/', views.edit_table, name='edit_table'),
    path('tables/delete/<int:pk>/', views.delete_table, name='delete_table'),

    # Menu
    path('menu/', views.menu, name='menu'),
    path('menu/add/', views.add_menu_item, name='add_menu_item'),
    path('menu/<int:pk>/update/', views.update_menu_item, name='update_menu_item'),
    path('menu/<int:pk>/delete/', views.delete_menu_item, name='delete_menu_item'),

    # Orders
    path('orders/', views.orders, name='orders'),
    path('orders/select_table/', views.select_table_for_order, name='select_table_for_order'),
    path('orders/create/<int:table_id>/', views.create_order, name='create_order'),
    path('orders/', views.orders, name='orders'),  
    path('orders/add_items/<int:order_id>/', views.add_items_to_order, name='add_items_to_order'),
    path('orders/update_item/<int:order_item_id>/', views.update_order_item, name='update_order_item'),
    path('orders/delete/<int:order_id>/', views.delete_order, name='delete_order'),
    path('orders/delete_item/<int:order_item_id>/', views.delete_order_item, name='delete_order_item'),
    path('orders/<int:id>/', views.order_detail, name='order_detail'),
    path('orders/<int:order_id>/add_item/', views.add_order_item, name='add_order_item'),
    path('orders/<int:order_id>/change-status/', views.change_order_status, name='change_order_status'),

    # Employees
    path('employees/', views.employees, name='employees'),
    path('employees/create/', views.create_employee, name='create_employee'),
    path('employees/update/<int:employee_id>/', views.update_employee, name='update_employee'),
    path('employees/delete/<int:employee_id>/', views.delete_employee, name='delete_employee'),

    # Miscellaneous
    path('dashboard/', views.dashboard_view, name='dashboard.view'),
    path('orders/<int:order_id>/item/<int:item_id>/decrease/', views.decrease_item_quantity, name='decrease_item_quantity'),
    path('orders/<int:order_id>/item/<int:item_id>/increase/', views.increase_item_quantity, name='increase_item_quantity'),


]
