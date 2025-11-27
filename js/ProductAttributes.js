// ============================================================================
// PREDEFINED PRODUCT ATTRIBUTES
// ============================================================================
// This comprehensive array defines all possible attributes for restaurant/café menu items
// Structure matches backend AttributeDto: { Name, Value, MeasurementUnit }
// Categories correspond to backend FoodCategory enum

const PREDEFINED_ATTRIBUTES = [
    // ========== SIZE & PORTIONING ==========
    {
        name: "Size",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "Pasta", "FriedChicken", "Grill", "Dessert", "IceCream", "Coffee", "Beverage", "Juice"],
        commonValues: ["Small", "Medium", "Large", "Extra Large", "Personal", "Family", "Party Size"]
    },
    {
        name: "Weight",
        measurementUnit: "grams",
        category: ["Burger", "Grill", "FriedChicken", "Seafood", "MainCourse", "SideDish"],
        commonValues: ["100", "150", "200", "250", "300", "400", "500"]
    },
    {
        name: "Volume",
        measurementUnit: "ml",
        category: ["Coffee", "Beverage", "Juice", "Soup"],
        commonValues: ["250", "350", "500", "750", "1000"]
    },
    {
        name: "Servings",
        measurementUnit: "persons",
        category: ["Pizza", "Pasta", "Dessert", "Salad", "Soup", "MainCourse"],
        commonValues: ["1", "2", "3", "4", "6", "8"]
    },
    {
        name: "Pieces Count",
        measurementUnit: "pieces",
        category: ["FriedChicken", "Sushi", "Appetizer", "Dessert", "Pastry"],
        commonValues: ["3", "6", "9", "12", "24"]
    },

    // ========== SPICE & FLAVOR INTENSITY ==========
    {
        name: "Spice Level",
        measurementUnit: "level",
        category: ["Burger", "Pizza", "Grill", "Shawarma", "Kebab", "Tacos", "Noodles", "RiceDishes", "MainCourse"],
        commonValues: ["Mild", "Medium", "Hot", "Extra Hot", "No Spice"]
    },
    {
        name: "Salt Level",
        measurementUnit: "level",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "FriedChicken", "Grill", "Appetizer", "SideDish"],
        commonValues: ["Light", "Normal", "Extra", "No Salt"]
    },
    {
        name: "Sugar Level",
        measurementUnit: "level",
        category: ["Coffee", "Dessert", "IceCream", "Juice", "Beverage", "Pastry"],
        commonValues: ["No Sugar", "Low", "Medium", "Sweet", "Extra Sweet"]
    },
    {
        name: "Sweetness",
        measurementUnit: "percentage",
        category: ["Dessert", "IceCream", "Coffee", "Juice", "Pastry"],
        commonValues: ["25%", "50%", "75%", "100%"]
    },

    // ========== TEMPERATURE ==========
    {
        name: "Temperature",
        measurementUnit: "option",
        category: ["Coffee", "Beverage", "Soup", "Sandwich"],
        commonValues: ["Hot", "Warm", "Cold", "Iced", "Room Temperature"]
    },
    {
        name: "Ice Level",
        measurementUnit: "percentage",
        category: ["Coffee", "Beverage", "Juice"],
        commonValues: ["No Ice", "25%", "50%", "75%", "100%", "Extra Ice"]
    },

    // ========== COOKING PREFERENCES ==========
    {
        name: "Cooking Preference",
        measurementUnit: "option",
        category: ["Burger", "Grill", "MainCourse"],
        commonValues: ["Rare", "Medium Rare", "Medium", "Medium Well", "Well Done"]
    },
    {
        name: "Grilling Level",
        measurementUnit: "option",
        category: ["Burger", "Grill", "Kebab", "Seafood"],
        commonValues: ["Lightly Grilled", "Medium Grilled", "Well Grilled", "Charred"]
    },
    {
        name: "Crispy Level",
        measurementUnit: "level",
        category: ["FriedChicken", "Pizza", "Pastry", "Appetizer"],
        commonValues: ["Soft", "Lightly Crispy", "Crispy", "Extra Crispy"]
    },

    // ========== DAIRY & MILK OPTIONS ==========
    {
        name: "Milk Type",
        measurementUnit: "option",
        category: ["Coffee", "Dessert", "IceCream", "Beverage"],
        commonValues: ["Whole Milk", "Skim Milk", "Oat Milk", "Almond Milk", "Soy Milk", "Coconut Milk", "No Milk"]
    },
    {
        name: "Cheese Type",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Pasta", "Salad"],
        commonValues: ["Cheddar", "Mozzarella", "Parmesan", "Swiss", "Blue Cheese", "Feta", "None", "Extra Cheese"]
    },
    {
        name: "Cream",
        measurementUnit: "option",
        category: ["Coffee", "Dessert", "Soup", "Pasta"],
        commonValues: ["No Cream", "Light Cream", "Regular Cream", "Extra Cream", "Whipped Cream"]
    },

    // ========== PROTEIN & MAIN INGREDIENTS ==========
    {
        name: "Protein Type",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "Pasta", "Tacos", "Noodles", "RiceDishes", "MainCourse"],
        commonValues: ["Beef", "Chicken", "Lamb", "Pork", "Fish", "Shrimp", "Tofu", "Mixed", "None"]
    },
    {
        name: "Meat Cut",
        measurementUnit: "option",
        category: ["Burger", "Grill", "MainCourse"],
        commonValues: ["Tenderloin", "Ribeye", "Sirloin", "Brisket", "Ground", "Strips"]
    },
    {
        name: "Seafood Type",
        measurementUnit: "option",
        category: ["Seafood", "Sushi", "Pasta", "Salad"],
        commonValues: ["Salmon", "Tuna", "Shrimp", "Crab", "Lobster", "Calamari", "Mixed Seafood"]
    },

    // ========== BREAD & CARBS ==========
    {
        name: "Bread Type",
        measurementUnit: "option",
        category: ["Burger", "Sandwich", "Shawarma", "Kebab"],
        commonValues: ["White Bread", "Whole Wheat", "Gluten-Free", "Brioche", "Ciabatta", "Pita", "Tortilla", "Sesame Bun"]
    },
    {
        name: "Pasta Type",
        measurementUnit: "option",
        category: ["Pasta"],
        commonValues: ["Spaghetti", "Penne", "Fettuccine", "Linguine", "Rigatoni", "Farfalle", "Gluten-Free Pasta"]
    },
    {
        name: "Rice Type",
        measurementUnit: "option",
        category: ["RiceDishes", "Sushi"],
        commonValues: ["White Rice", "Brown Rice", "Jasmine", "Basmati", "Sticky Rice", "Fried Rice"]
    },
    {
        name: "Crust Type",
        measurementUnit: "option",
        category: ["Pizza"],
        commonValues: ["Thin Crust", "Thick Crust", "Stuffed Crust", "Gluten-Free", "Cauliflower Crust"]
    },

    // ========== SAUCES & DRESSINGS ==========
    {
        name: "Sauce",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Pasta", "Shawarma", "Kebab", "Tacos", "FriedChicken", "Grill"],
        commonValues: ["Ketchup", "Mayo", "Mustard", "BBQ", "Hot Sauce", "Garlic", "Tahini", "Marinara", "Alfredo", "Pesto", "None", "Extra Sauce"]
    },
    {
        name: "Dressing",
        measurementUnit: "option",
        category: ["Salad"],
        commonValues: ["Ranch", "Caesar", "Balsamic", "Olive Oil", "Lemon", "Vinaigrette", "Thousand Island", "On the Side", "None"]
    },

    // ========== TOPPINGS & ADD-ONS ==========
    {
        name: "Toppings",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "IceCream", "Dessert"],
        commonValues: ["Lettuce", "Tomato", "Onion", "Pickles", "Mushrooms", "Peppers", "Olives", "Extra Toppings", "None"]
    },
    {
        name: "Vegetables",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "Pasta", "Shawarma", "Tacos"],
        commonValues: ["Mixed Veggies", "Extra Veggies", "Light Veggies", "No Veggies"]
    },
    {
        name: "Nuts",
        measurementUnit: "option",
        category: ["Salad", "Dessert", "IceCream", "Pastry"],
        commonValues: ["Almonds", "Walnuts", "Cashews", "Peanuts", "Pistachios", "Mixed Nuts", "None"]
    },
    {
        name: "Fruits",
        measurementUnit: "option",
        category: ["Salad", "Dessert", "IceCream", "Juice", "Pastry"],
        commonValues: ["Strawberry", "Banana", "Mango", "Berries", "Pineapple", "Apple", "Mixed Fruits", "None"]
    },

    // ========== COFFEE & BEVERAGE SPECIFIC ==========
    {
        name: "Coffee Strength",
        measurementUnit: "level",
        category: ["Coffee"],
        commonValues: ["Single Shot", "Double Shot", "Triple Shot", "Decaf"]
    },
    {
        name: "Flavor Shot",
        measurementUnit: "option",
        category: ["Coffee", "Beverage"],
        commonValues: ["Vanilla", "Caramel", "Hazelnut", "Mocha", "Chocolate", "Peppermint", "None"]
    },
    {
        name: "Foam Level",
        measurementUnit: "level",
        category: ["Coffee"],
        commonValues: ["No Foam", "Light Foam", "Regular Foam", "Extra Foam"]
    },

    // ========== DIETARY & ALLERGENS ==========
    {
        name: "Dietary Option",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "Pasta", "MainCourse"],
        commonValues: ["Regular", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb"]
    },
    {
        name: "Allergen-Free",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "Pasta", "Dessert", "IceCream"],
        commonValues: ["Contains Gluten", "Gluten-Free", "Nut-Free", "Dairy-Free", "Egg-Free"]
    },

    // ========== PACKAGING & PRESENTATION ==========
    {
        name: "Packaging",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Sandwich", "Salad", "FriedChicken", "Dessert", "IceCream"],
        commonValues: ["Eco-Friendly", "Standard Box", "Wrapped", "Individual Pack", "Family Pack"]
    },
    {
        name: "Presentation",
        measurementUnit: "option",
        category: ["Dessert", "IceCream", "Salad", "MainCourse"],
        commonValues: ["Standard", "Premium", "Gift Box"]
    },

    // ========== COMBO & SIDES ==========
    {
        name: "Combo Option",
        measurementUnit: "option",
        category: ["Burger", "FriedChicken", "Sandwich", "Shawarma"],
        commonValues: ["Sandwich Only", "With Fries", "With Drink", "Full Meal", "Deluxe Combo"]
    },
    {
        name: "Side Dish",
        measurementUnit: "option",
        category: ["Burger", "Grill", "FriedChicken", "MainCourse"],
        commonValues: ["Fries", "Coleslaw", "Rice", "Mashed Potatoes", "Vegetables", "None"]
    },

    // ========== SPECIAL CUSTOMIZATIONS ==========
    {
        name: "Garlic Level",
        measurementUnit: "level",
        category: ["Pizza", "Pasta", "Grill", "Shawarma", "Kebab"],
        commonValues: ["No Garlic", "Light", "Normal", "Extra Garlic"]
    },
    {
        name: "Oil Type",
        measurementUnit: "option",
        category: ["Salad", "Pasta", "Grill"],
        commonValues: ["Olive Oil", "Vegetable Oil", "Sesame Oil", "Light Oil", "None"]
    },
    {
        name: "Sauce Amount",
        measurementUnit: "level",
        category: ["Burger", "Pizza", "Sandwich", "Pasta", "Shawarma"],
        commonValues: ["Light", "Normal", "Extra", "On the Side"]
    },
    {
        name: "Onion Type",
        measurementUnit: "option",
        category: ["Burger", "Pizza", "Salad", "Grill"],
        commonValues: ["Raw", "Grilled", "Caramelized", "Fried", "None"]
    }
];

// Helper function to get attributes for specific food categories
function getAttributesForCategories(selectedCategories) {
    if (!selectedCategories || selectedCategories.length === 0) {
        return [];
    }
    
    const relevantAttributes = PREDEFINED_ATTRIBUTES.filter(attr => {
        // Check if any of the selected categories match the attribute's categories
        return selectedCategories.some(selectedCat => 
            attr.category.includes(selectedCat)
        );
    });
    
    // Remove duplicates and return
    const uniqueAttributes = [];
    const seen = new Set();
    
    relevantAttributes.forEach(attr => {
        if (!seen.has(attr.name)) {
            seen.add(attr.name);
            uniqueAttributes.push(attr);
        }
    });
    
    return uniqueAttributes;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PREDEFINED_ATTRIBUTES, getAttributesForCategories };
}
