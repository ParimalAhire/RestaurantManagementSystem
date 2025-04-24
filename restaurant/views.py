from django.shortcuts import render, redirect, get_object_or_404
from datetime import datetime, timedelta, timezone
from .models import MenuItem, Table, Customer, Order, Employee, OrderItem
from .forms import CustomerForm, TableForm, MenuItemForm, OrderForm, OrderItemForm, UpdateOrderForm, UpdateOrderItemForm, EmployeeForm
from django.contrib import messages
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone

def dashboard(request):
    # Get weekly sales data
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    weekly_sales = []
    
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_sales = Order.objects.filter(
            created_at__date=day
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        weekly_sales.append(float(day_sales))

    # Get popular items data
    popular_items = OrderItem.objects.values(
        'menu_item__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:4]

    popular_items_data = {
        'labels': [item['menu_item__name'] for item in popular_items],
        'data': [item['count'] for item in popular_items]
    }

    total_orders = Order.objects.count()
    occupied_tables = Table.objects.filter(occupied=True).count()
    total_menu_items = MenuItem.objects.count()
    total_customers = Customer.objects.count()
    total_employees = Employee.objects.count()

    context = {
        'total_orders': total_orders,
        'occupied_tables': occupied_tables,
        'total_menu_items': total_menu_items,
        'total_customers': total_customers,
        'total_employees': total_employees,
        'weekly_sales': weekly_sales,
        'popular_items': popular_items_data,
    }
    return render(request, 'restaurant/dashboard.html', context)

def tables(request):
    tables = Table.objects.all()
    return render(request, 'restaurant/tables.html', {'tables': tables})

def customers(request):
    customers = Customer.objects.all()
    return render(request, 'restaurant/customers.html', {'customers': customers})

def orders(request):
    orders = Order.objects.all()
    return render(request, 'restaurant/orders.html', {'orders': orders})

def menu(request):
    menu_items = MenuItem.objects.all()
    return render(request, 'restaurant/menu.html', {'menu_items': menu_items})

def employees(request):
    employees = Employee.objects.all()
    return render(request, 'restaurant/employees.html', {'employees': employees})


# Customers
def customer_list(request):
    customers = Customer.objects.all()
    return render(request, 'restaurant/customers.html', {'customers': customers})

def add_customer(request):
    if request.method == "POST":
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('customers')  
    else:
        form = CustomerForm()

    return render(request, 'restaurant/add_customer.html', {'form': form})

# View to edit an existing customer (pk required)
def edit_customer(request, pk):
    customer = get_object_or_404(Customer, pk=pk)  
    if request.method == "POST":
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            form.save()
            return redirect('customers')  
    else:
        form = CustomerForm(instance=customer)

    return render(request, 'restaurant/edit_customer.html', {'form': form, 'customer': customer})

def delete_customer(request,pk):
    customer = get_object_or_404(Customer, pk=pk)
    customer.delete()
    messages.success(request, "Customer deleted successfully!")
    return redirect('customers') 

# Tables
def tables(request):
    all_tables = Table.objects.all()
    return render(request, 'restaurant/tables.html', {'tables': all_tables})

def add_table(request):
    if request.method == 'POST':
        form = TableForm(request.POST)
        if form.is_valid():
            form.save()  
            return redirect('tables')
    else:
        form = TableForm()
    return render(request, 'restaurant/table_form.html', {'form': form, 'title': 'Add Table'})

def edit_table(request, pk):
    table = get_object_or_404(Table, pk=pk)
    if request.method == 'POST':
        form = TableForm(request.POST, instance=table)
        if form.is_valid():
            form.save()  
            return redirect('tables')
    else:
        form = TableForm(instance=table)
    return render(request, 'restaurant/table_form.html', {'form': form, 'title': 'Edit Table'})

def delete_table(request, pk):
    table = get_object_or_404(Table, pk=pk)
    table.delete()
    return redirect('tables')


# Menu
def menu_list(request):
    menu_items = MenuItem.objects.all()
    return render(request, 'restaurant/menu.html', {'menu_items': menu_items})

# View to add a new menu item
def add_menu_item(request):
    if request.method == 'POST':
        form = MenuItemForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('menu') 
    else:
        form = MenuItemForm()
    return render(request, 'restaurant/menu_form.html', {'form': form})

# View to update an existing menu item
def update_menu_item(request, pk):
    menu_item = get_object_or_404(MenuItem, pk=pk)
    if request.method == 'POST':
        form = MenuItemForm(request.POST, instance=menu_item)
        if form.is_valid():
            form.save()
            return redirect('menu')
    else:
        form = MenuItemForm(instance=menu_item)
    return render(request, 'restaurant/menu_form.html', {'form': form})

# View to delete a menu item
def delete_menu_item(request, pk):
    menu_item = get_object_or_404(MenuItem, pk=pk)
    menu_item.delete()
    return redirect('menu')


# Orders
def order_list(request):
    orders = Order.objects.all() 
    return render(request, 'restaurant/order.html', {'orders': orders})


# View to create an order for a specific table
def create_order(request, table_id):
    table = get_object_or_404(Table, id=table_id)
    if not table.customer:
        messages.error(request, "This table does not have a customer assigned.")
        return redirect('tables')

    if request.method == 'POST':
        form = OrderForm(request.POST)
        if form.is_valid():
            order = form.save(commit=False)
            order.table = table
            order.customer = table.customer
            order.save()
            return redirect('add_items_to_order', order.id)
    else:
        form = OrderForm()

    return render(request, 'restaurant/order_form.html', {'form': form, 'table': table})

# View to add items to an order
def add_items_to_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if request.method == 'POST':
        form = OrderItemForm(request.POST)
        if form.is_valid():
            order_item = form.save(commit=False)
            order_item.order = order
            order_item.save()

            # Recalculate total amount
            order.total_amount = sum(item.price * item.quantity for item in order.orderitem_set.all())
            order.save()

            return redirect('add_items_to_order', order.id)
    else:
        form = OrderItemForm()

    menu_items = MenuItem.objects.all()
    return render(request, 'restaurant/order_items_form.html', {'form': form, 'order': order, 'menu_items': menu_items})

# View to update the status of an order
def update_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    if request.method == 'POST':
        form = UpdateOrderForm(request.POST, instance=order)
        if form.is_valid():
            form.save()

            order.total_amount = sum(item.price * item.quantity for item in order.orderitem_set.all())
            order.save()

            return redirect('orders')
    else:
        form = UpdateOrderForm(instance=order)

    return render(request, 'restaurant/update_order_form.html', {'form': form, 'order': order})

# View to update an order item
def update_order_item(request, order_item_id):
    order_item = get_object_or_404(OrderItem, id=order_item_id)

    if request.method == 'POST':
        form = UpdateOrderItemForm(request.POST, instance=order_item)
        if form.is_valid():
            order_item = form.save()

            order_item.order.total_amount = sum(item.price * item.quantity for item in order_item.order.orderitem_set.all())
            order_item.order.save()

            return redirect('add_items_to_order', order_item.order.id)
    else:
        form = UpdateOrderItemForm(instance=order_item)

    return render(request, 'restaurant/update_order_item_form.html', {'form': form, 'order_item': order_item})

# View to delete an order
def delete_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    order.delete()
    return redirect('orders')

# View to delete an order item
def delete_order_item(request, order_item_id):
    order_item = get_object_or_404(OrderItem, id=order_item_id)
    order = order_item.order
    order_item.delete()

    order.total_amount = sum(item.price * item.quantity for item in order.orderitem_set.all())
    order.save()

    return redirect('add_items_to_order', order.id)

def select_table_for_order(request):
    tables = Table.objects.all()
    return render(request, 'restaurant/select_table.html', {'tables': tables})

def order_detail(request, id):
    order = get_object_or_404(Order, id=id)
    return render(request, 'restaurant/order_detail.html', {'order': order})

def add_order_item(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    
    if request.method == 'POST':
        form = OrderItemForm(request.POST)
        if form.is_valid():
            order_item = form.save(commit=False)
            order_item.order = order  
            order_item.save()
            return redirect('order_detail', id=order.id)  
    
    else:
        form = OrderItemForm()

    return render(request, 'restaurant/add_order_item.html', {'order': order, 'form': form})

# Employees
# View to show the main employee page
def employee_dashboard(request):
    employees = Employee.objects.all()
    return render(request, 'restaurant/employee.html', {'employees': employees})

# View to create a new employee
def create_employee(request):
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Employee created successfully!")
            return redirect('employees')  
    else:
        form = EmployeeForm()
    return render(request, 'restaurant/employee_form.html', {'form': form})

# View to update an employee
def update_employee(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    if request.method == 'POST':
        form = EmployeeForm(request.POST, instance=employee)
        if form.is_valid():
            form.save()
            messages.success(request, "Employee updated successfully!")
            return redirect('employees')  
    else:
        form = EmployeeForm(instance=employee)
    return render(request, 'restaurant/employee_form.html', {'form': form})

# View to delete an employee
def delete_employee(request, employee_id):
    employee = get_object_or_404(Employee, id=employee_id)
    employee.delete()
    messages.success(request, "Employee deleted successfully!")
    return redirect('employees') 

def increase_item_quantity(request, order_id, item_id):
    item = get_object_or_404(OrderItem, id=item_id, order_id=order_id)
    item.quantity += 1
    item.price = item.quantity * item.menu_item.price
    item.save()

    # Update order total
    order = item.order
    order.total_amount = sum(i.price for i in order.orderitem_set.all())
    order.save()

    return redirect('order_detail', id=order_id)

def decrease_item_quantity(request, order_id, item_id):
    item = get_object_or_404(OrderItem, id=item_id, order_id=order_id)
    order = item.order

    if item.quantity > 1:
        item.quantity -= 1
        item.price = item.quantity * item.menu_item.price
        item.save()
    else:
        item.delete()

    # Update order total
    order.total_amount = sum(i.price for i in order.orderitem_set.all())
    order.save()

    return redirect('order_detail', id=order_id)

# def delete_order_item(request, item_id):
#     item = get_object_or_404(OrderItem, id=item_id)
#     order_id = item.order.id
#     item.delete()
#     return redirect('order_detail', id=order_id)

def dashboard_view(request):
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    total_tables = Table.objects.count()

    occupied_tables_today = Table.objects.filter(occupied=True, updated_at__date=today).count()
    occupied_tables_week = Table.objects.filter(occupied=True, updated_at__gte=week_ago).count()
    occupied_tables_month = Table.objects.filter(occupied=True, updated_at__gte=month_ago).count()

    context = {
        'total_orders': Order.objects.filter(created_at__date=today).count(),
        'total_orders_week': Order.objects.filter(created_at__gte=week_ago).count(),
        'total_orders_month': Order.objects.filter(created_at__gte=month_ago).count(),

        'occupied_tables': occupied_tables_today,
        'occupied_tables_week': occupied_tables_week,
        'occupied_tables_month': occupied_tables_month,

        'total_menu_items': MenuItem.objects.count(),
        'total_customers': Customer.objects.count(),
        'total_customers_week': Customer.objects.filter(created_at__gte=week_ago).count(),
        'total_customers_month': Customer.objects.filter(created_at__gte=month_ago).count(),

        'total_employees': Employee.objects.count(),
        'total_tables': total_tables,

        'occupancy_rate': (occupied_tables_today / total_tables * 100) if total_tables > 0 else 0,
        'occupancy_rate_week': (occupied_tables_week / total_tables * 100) if total_tables > 0 else 0,
        'occupancy_rate_month': (occupied_tables_month / total_tables * 100) if total_tables > 0 else 0,
    }
    return render(request, 'restaurant/dashboard.html', context)


def change_order_status(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(Order.ORDER_STATUS_CHOICES):
            order.status = new_status
            order.save()
    return redirect('order_detail', id=order.id)

def order_receipt(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    return render(request, 'restaurant/receipt.html', {'order': order})