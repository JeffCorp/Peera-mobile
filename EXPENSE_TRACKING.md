# Expense Tracking Functionality

## Overview

This implementation provides comprehensive expense tracking functionality for the React Native app, including expense management, categorization, receipt capture, and detailed analytics.

## Features Implemented

### 1. Add Expense Screen

- **Amount input** with currency formatting
- **Category selection** with visual icons and colors
- **Description field** with validation
- **Date picker** with calendar integration
- **Receipt capture** with camera integration
- **Calendar event linking** (optional)
- **Form validation** with error handling

### 2. Expense List Screen

- **Categorized expenses** with grouping
- **Search functionality** across all fields
- **Category filtering** with quick access
- **Date range filtering** (ready for implementation)
- **Amount range filtering** (ready for implementation)
- **Statistics dashboard** with totals and averages
- **CRUD operations** (Create, Read, Update, Delete)

### 3. Category Management

- **Pre-built categories** with icons and colors
- **Category CRUD operations**
- **Budget tracking** (ready for implementation)
- **Visual category indicators**

### 4. Receipt Capture

- **Camera integration** with permissions
- **Gallery selection** option
- **Image validation** and compression
- **File size limits** and format validation
- **Receipt preview** and removal

### 5. Data Management

- **Local storage** with mock data
- **User-specific expenses**
- **Data validation** and sanitization
- **Error handling** and recovery

## Technical Implementation

### Dependencies

```json
{
  "@react-native-community/datetimepicker": "^7.6.1"
}
```

### Key Components

#### 1. ExpenseService (`src/services/expenseService.ts`)

- **CRUD operations** for expenses
- **Category management**
- **Data validation** and formatting
- **Statistics calculation**
- **Filtering and search**

#### 2. CameraService (`src/services/cameraService.ts`)

- **Camera permissions** handling
- **Photo capture** and gallery selection
- **Image validation** and compression
- **File management**

#### 3. AddExpenseScreen (`src/screens/main/AddExpenseScreen.tsx`)

- **Form management** with validation
- **Category selection** modal
- **Date picker** integration
- **Receipt capture** functionality
- **Calendar integration** (placeholder)

#### 4. ExpensesScreen (`src/screens/main/ExpensesScreen.tsx`)

- **Expense listing** with grouping
- **Search and filtering**
- **Statistics display**
- **CRUD operations**

### Data Models

#### Expense Interface

```typescript
interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUri?: string;
  calendarEventId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Category Interface

```typescript
interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}
```

#### Form Data Interface

```typescript
interface ExpenseFormData {
  amount: string;
  category: string;
  description: string;
  date: string;
  receiptUri?: string;
  calendarEventId?: string;
}
```

## Usage Instructions

### For Users

#### Adding an Expense

1. **Navigate** to the Expenses screen
2. **Tap** the "+" button to add a new expense
3. **Enter amount** in the currency field
4. **Select category** from the dropdown
5. **Add description** of the expense
6. **Choose date** using the date picker
7. **Capture receipt** (optional) using camera or gallery
8. **Link to calendar** event (optional)
9. **Submit** the form

#### Managing Expenses

1. **View expenses** grouped by category
2. **Search** for specific expenses
3. **Filter** by category using quick filters
4. **View statistics** at the top of the screen
5. **Edit or delete** expenses using action buttons

#### Receipt Capture

1. **Tap** "Capture Receipt" button
2. **Choose** between camera or gallery
3. **Take photo** or select existing image
4. **Preview** the captured receipt
5. **Remove** if needed

### For Developers

#### Adding New Categories

```typescript
// In expenseService.ts, add to categories array
{
  id: '11',
  name: 'Your Category',
  icon: '🎯',
  color: '#FF6B6B',
  budget: 1000, // Optional budget limit
}
```

#### Integrating Real Camera

```typescript
// Replace mock camera service with real implementation
import * as ImagePicker from 'expo-image-picker';

async takePhoto(): Promise<CameraResult | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return {
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
      type: 'image',
    };
  }
  return null;
}
```

#### Adding Database Integration

```typescript
// Replace mock data with real database calls
async getExpenses(userId: string): Promise<Expense[]> {
  const response = await fetch(`/api/expenses?userId=${userId}`);
  return response.json();
}

async createExpense(userId: string, data: ExpenseFormData): Promise<Expense> {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, userId }),
  });
  return response.json();
}
```

## Validation Rules

### Amount Validation

- **Required field**
- **Must be positive number**
- **Maximum 2 decimal places**
- **Currency formatting**

### Category Validation

- **Required field**
- **Must be from predefined list**
- **Case-sensitive matching**

### Description Validation

- **Required field**
- **Maximum 200 characters**
- **Trimmed whitespace**

### Date Validation

- **Required field**
- **Valid date format**
- **Cannot be future date**

### Receipt Validation

- **Optional field**
- **Valid image format** (jpg, png, gif, bmp, webp)
- **Maximum file size** (10MB)
- **Maximum dimensions** (4096x4096)

## Error Handling

### Common Error Scenarios

1. **Network failures** - Retry mechanisms
2. **Permission denied** - User guidance
3. **Invalid data** - Form validation
4. **File upload failures** - Fallback options
5. **Storage issues** - Error recovery

### Error Recovery

- **Automatic retry** for transient errors
- **User-friendly error messages**
- **Graceful degradation** when services unavailable
- **Data validation** before submission

## Performance Considerations

### Optimization Strategies

- **Image compression** for receipts
- **Lazy loading** for expense lists
- **Caching** of categories and stats
- **Debounced search** input
- **Virtualized lists** for large datasets

### Best Practices

- **Efficient filtering** algorithms
- **Minimal re-renders** with proper state management
- **Memory management** for images
- **Background processing** for heavy operations

## Security Considerations

### Data Protection

- **Input sanitization** for all user data
- **File type validation** for uploads
- **Size limits** for images
- **User authentication** for data access

### Privacy

- **Local storage** for sensitive data
- **Secure transmission** to backend
- **Data retention** policies
- **User consent** for camera access

## Future Enhancements

### Planned Features

1. **Budget tracking** and alerts
2. **Expense reports** and analytics
3. **Receipt OCR** for automatic data extraction
4. **Export functionality** (PDF, CSV)
5. **Multi-currency support**
6. **Expense sharing** and collaboration
7. **Recurring expenses** management
8. **Tax categorization** and reporting

### Technical Improvements

1. **Real-time sync** with backend
2. **Offline support** with sync
3. **Push notifications** for budget alerts
4. **Advanced analytics** and insights
5. **Machine learning** for categorization
6. **Voice input** for expense entry

## Testing

### Manual Testing Checklist

1. **Form validation** - All required fields
2. **Category selection** - All categories work
3. **Date picker** - Date selection and validation
4. **Receipt capture** - Camera and gallery
5. **Search functionality** - All search terms
6. **Filtering** - Category and date filters
7. **CRUD operations** - Create, read, update, delete
8. **Error handling** - Network and validation errors

### Automated Testing

```typescript
// Example test structure
describe("ExpenseService", () => {
  test("should create expense with valid data", async () => {
    const expenseData = {
      amount: "25.50",
      category: "Food & Dining",
      description: "Lunch",
      date: "2024-01-15",
    };

    const result = await expenseService.createExpense("user1", expenseData);
    expect(result.amount).toBe(25.5);
    expect(result.category).toBe("Food & Dining");
  });

  test("should validate expense form data", () => {
    const invalidData = {
      amount: "",
      category: "",
      description: "",
      date: "",
    };

    const errors = expenseService.validateExpenseForm(invalidData);
    expect(errors.amount).toBeDefined();
    expect(errors.category).toBeDefined();
    expect(errors.description).toBeDefined();
    expect(errors.date).toBeDefined();
  });
});
```

## Support and Troubleshooting

### Common Issues

1. **Camera not working** - Check permissions
2. **Images not loading** - Check file format and size
3. **Search not finding results** - Check spelling and filters
4. **Form not submitting** - Check validation errors
5. **Categories not loading** - Check network connection

### Debug Information

- **Console logging** for development
- **Error tracking** for production
- **Performance monitoring**
- **User feedback** collection

### Performance Monitoring

- **Load times** for expense lists
- **Image upload** success rates
- **Search response** times
- **Memory usage** for large datasets
