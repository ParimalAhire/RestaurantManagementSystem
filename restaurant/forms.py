from django import forms
from .models import MenuItem, Customer, Table, Order, OrderItem, Employee


class MenuItemForm(forms.ModelForm):
    class Meta:
        model = MenuItem
        fields = ['name', 'description', 'price', 'category', 'available']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'description': forms.Textarea(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
                'rows': 3
            }),
            'price': forms.NumberInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'category': forms.TextInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'available': forms.CheckboxInput(attrs={
                'class': 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            }),
        }


class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['name', 'email', 'phone']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
        }


class TableForm(forms.ModelForm):
    class Meta:
        model = Table
        fields = ['number', 'capacity', 'customer', 'occupied']
        widgets = {
            'number': forms.NumberInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'capacity': forms.NumberInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'customer': forms.Select(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'occupied': forms.CheckboxInput(attrs={
                'class': 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.customer:
            self.fields['occupied'].initial = True
        else:
            self.fields['occupied'].initial = False
        self.fields['customer'].required = False

    def clean_customer(self):
        customer = self.cleaned_data.get('customer')
        self.cleaned_data['occupied'] = bool(customer)
        return customer


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['status']
        widgets = {
            'status': forms.Select(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
        }


class OrderItemForm(forms.ModelForm):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity']
        widgets = {
            'menu_item': forms.Select(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'quantity': forms.NumberInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
        }

    def save(self, commit=True):
        order_item = super().save(commit=False)
        order_item.price = order_item.menu_item.price
        if commit:
            order_item.save()
        return order_item


class UpdateOrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['status']
        widgets = {
            'status': forms.Select(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
        }


class UpdateOrderItemForm(forms.ModelForm):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity']
        widgets = {
            'menu_item': forms.Select(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'quantity': forms.NumberInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
        }

    def save(self, commit=True):
        order_item = super().save(commit=False)
        order_item.price = order_item.menu_item.price
        if commit:
            order_item.save()
        return order_item


class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['name', 'email', 'phone', 'salary', 'role']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'salary': forms.NumberInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
            'role': forms.TextInput(attrs={
                'class': 'mt-1 block w-full px-3 py-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            }),
        }
