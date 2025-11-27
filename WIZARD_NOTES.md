# Multi-Step Product Wizard Implementation Notes

## Design

The wizard replaces the current product modal with 4 distinct steps:

### Step 1: Basic Information
- Product Name (required)
- Price (required)
- Description (optional)

### Step 2: Category Selection  
- Multi-select checkboxes for FoodCategory enum (25 categories)
- Products can belong to multiple categories
- At least 1 category must be selected

### Step 3: Attributes
- Dynamic attributes appear based on selected categories
- Uses `getAttributesForCategories()` from ProductAttributes.js
- Merchant selects relevant attributes and provides values
- Each attribute shows: name (read-only), value input, measurement unit (auto-filled)

### Step 4: Review & Confirm
- Show all product details
- List selected categories
- List configured attributes
- Confirm or go back to edit

## Backend Matching

**ProductRequest** structure (from backend):
```csharp
{
    string ProductName,
    string ProductDescription,
    string Price,
    ICollection<AttributeDto> Attributes,  // {Name, Value, MeasurementUnit}
    ICollection<FoodCategory> Categories    // Integer enum values
}
```

**Create endpoint**: `POST /api/Merchants/create-product`

## Implementation Strategy

1. Replace current product modal HTML with wizard structure
2. Add wizard state management in MerchantDashboard.js
3. Implement step navigation (Next/Previous/Submit)
4. Wire up category selection → dynamic attributes
5. Build final payload matching backend DTO
6. Handle form submission to create product API

## UI/UX Requirements

- Step indicator showing current step (1/4, 2/4, etc.)
- "Next" button disabled until required fields filled
- "Previous" button to go back
- Final step shows "Create Product" button
- Clear validation messages for each step
