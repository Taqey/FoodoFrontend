// ============================================================================
// WIZARD FUNCTIONS FOR MULTI-STEP PRODUCT CREATION
// ============================================================================

// Open Product Wizard (Step 1)
function openProductModal() {
    // Reset wizard state
    wizardState.currentStep = 1;
    wizardState.productData = {
        name: '',
        price: '',
        description: '',
        selectedCategories: [],
        selectedCategoryIds: [],
        selectedAttributes: []
    };
    
    // Reset form inputs
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    
    // Show step 1, hide others
    showWizardStep(1);
    updateWizardButtons();
    
    productModal.show();
}

// Show specific wizard step
function showWizardStep(stepNumber) {
    // Hide all steps
    for (let i = 1; i <= wizardState.totalSteps; i++) {
        document.getElementById(`wizardStep${i}`).classList.add('d-none');
    }
    
    // Show requested step
    document.getElementById(`wizardStep${stepNumber}`).classList.remove('d-none');
    
    // Update step indicator
    document.getElementById('wizardStepIndicator').textContent = `Step ${stepNumber} of ${wizardState.totalSteps}`;
    
    wizardState.currentStep = stepNumber;
}

// Navigate to next wizard step
function nextWizardStep() {
    // Validate current step before proceeding
    if (wizardState.currentStep === 1) {
        // Step 1: Basic info validation
        const name = document.getElementById('productName').value.trim();
        const price = document.getElementById('productPrice').value;
        
        if (!name || !price) {
            alert('Please fill in Product Name and Price.');
            return;
        }
        
        // Save step 1 data
        wizardState.productData.name = name;
        wizardState.productData.price = price;
        wizardState.productData.description = document.getElementById('productDescription').value.trim();
        
        // Render categories for step 2
        renderCategoriesInWizard();
        
    } else if (wizardState.currentStep === 2) {
        // Step 2: Category validation
        const selectedCategories = [];
        const selectedCategoryIds = [];
        
        document.querySelectorAll('#categoryCheckboxes input[type="checkbox"]:checked').forEach(cb => {
            selectedCategories.push(cb.value);
            selectedCategoryIds.push(FOOD_CATEGORIES[cb.value]);
        });
        
        if (selectedCategories.length === 0) {
            alert('Please select at least one category.');
            return;
        }
        
        wizardState.productData.selectedCategories = selectedCategories;
        wizardState.productData.selectedCategoryIds = selectedCategoryIds;
        
        // Render attributes for step 3
        renderAttributesInWizard();
        
    } else if (wizardState.currentStep === 3) {
        // Step 3: Attributes (optional, collect selected)
        collectSelectedAttributes();
        
        // Render review for step 4
        renderReviewInWizard();
    }
    
    // Move to next step
    if (wizardState.currentStep < wizardState.totalSteps) {
        showWizardStep(wizardState.currentStep + 1);
        updateWizardButtons();
    }
}

// Navigate to previous wizard step
function previousWizardStep() {
    if (wizardState.currentStep > 1) {
        showWizardStep(wizardState.currentStep - 1);
        updateWizardButtons();
    }
}

// Update wizard navigation buttons
function updateWizardButtons() {
    const prevBtn = document.getElementById('wizardPrevBtn');
    const nextBtn = document.getElementById('wizardNextBtn');
    const submitBtn = document.getElementById('wizardSubmitBtn');
    
    // Previous button: show on steps 2, 3, 4
    if (wizardState.currentStep > 1) {
        prevBtn.classList.remove('d-none');
    } else {
        prevBtn.classList.add('d-none');
    }
    
    // Next button: show on steps 1, 2, 3
    if (wizardState.currentStep < wizardState.totalSteps) {
        nextBtn.classList.remove('d-none');
        submitBtn.classList.add('d-none');
    } else {
        // Step 4: show submit button
        nextBtn.classList.add('d-none');
        submitBtn.classList.remove('d-none');
    }
}

// Render categories in step 2
function renderCategoriesInWizard() {
    const container = document.getElementById('categoryCheckboxes');
    container.innerHTML = '';
    
    const categoryNames = Object.keys(FOOD_CATEGORIES).sort();
    categoryNames.forEach(categoryName => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-2';
        
        const checked = wizardState.productData.selectedCategories.includes(categoryName) ? 'checked' : '';
        
        col.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${categoryName}" 
                    id="cat_${categoryName}" ${checked}>
                <label class="form-check-label" for="cat_${categoryName}">
                    ${categoryName}
                </label>
            </div>
        `;
        container.appendChild(col);
    });
}

// Render attributes in step 3
function renderAttributesInWizard() {
    const container = document.getElementById('availableAttributes');
    container.innerHTML = '';
    
    // Get attributes for selected categories using ProductAttributes.js
    const relevantAttributes = getAttributesForCategories(wizardState.productData.selectedCategories);
    
    if (relevantAttributes.length === 0) {
        container.innerHTML = '<p class="text-muted">No specific attributes available for the selected categories.</p>';
        return;
    }
    
    relevantAttributes.forEach((attr, index) => {
        const card = document.createElement('div');
        card.className = 'card mb-3 p-3';
        card.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-1">
                    <input type="checkbox" class="form-check-input" id="attrCheck_${index}" 
                        onchange="toggleAttributeInput(${index})">
                </div>
                <div class="col-md-3">
                    <strong>${attr.name}</strong>
                    <small class="text-muted d-block">Unit: ${attr.measurementUnit}</small>
                </div>
                <div class="col-md-5">
                    <input type="text" class="form-control form-control-sm" 
                        id="attrValue_${index}" placeholder="Enter value" disabled>
                    <small class="text-muted">Common: ${attr.commonValues.slice(0, 3).join(', ')}</small>
                </div>
                <div class="col-md-3">
                    <code class="small">${attr.measurementUnit}</code>
                </div>
            </div>
        `;
        
        // Store attribute info in data attribute for later retrieval
        card.dataset.attrName = attr.name;
        card.dataset.attrUnit = attr.measurementUnit;
        card.dataset.attrIndex = index;
        
        container.appendChild(card);
    });
}

// Toggle attribute value input when checkbox is checked/unchecked
function toggleAttributeInput(index) {
    const checkbox = document.getElementById(`attrCheck_${index}`);
    const valueInput = document.getElementById(`attrValue_${index}`);
    valueInput.disabled = !checkbox.checked;
    if (!checkbox.checked) {
        valueInput.value = '';
    }
}

// Collect selected attributes from step 3
function collectSelectedAttributes() {
    const selectedAttributes = [];
    const container = document.getElementById('availableAttributes');
    const cards = container.querySelectorAll('.card');
    
    cards.forEach(card => {
        const index = card.dataset.attrIndex;
        const checkbox = document.getElementById(`attrCheck_${index}`);
        
        if (checkbox && checkbox.checked) {
            const valueInput = document.getElementById(`attrValue_${index}`);
            const value = valueInput.value.trim();
            
            if (value) {
                selectedAttributes.push({
                    name: card.dataset.attrName,
                    value: value,
                    measurementUnit: card.dataset.attrUnit
                });
            }
        }
    });
    
    wizardState.productData.selectedAttributes = selectedAttributes;
}

// Render review in step 4
function renderReviewInWizard() {
    document.getElementById('reviewName').textContent = wizardState.productData.name;
    document.getElementById('reviewPrice').textContent = `$${wizardState.productData.price}`;
    document.getElementById('reviewDescription').textContent = wizardState.productData.description || 'None';
    document.getElementById('reviewCategories').textContent = wizardState.productData.selectedCategories.join(', ');
    
    const attributesHtml = wizardState.productData.selectedAttributes.length > 0
        ? wizardState.productData.selectedAttributes.map(a => 
            `<span class="badge bg-info text-dark me-1">${a.name}: ${a.value} ${a.measurementUnit}</span>`
          ).join('')
        : 'None';
    document.getElementById('reviewAttributes').innerHTML = attributesHtml;
}

// Submit wizard product (final step)
async function submitWizardProduct() {
    // Build payload matching backend ProductRequest DTO
    const payload = {
        ProductName: wizardState.productData.name,
        ProductDescription: wizardState.productData.description,
        Price: wizardState.productData.price.toString(),
        Attributes: wizardState.productData.selectedAttributes.map(a => ({
            Name: a.name,
            Value: a.value,
            MeasurementUnit: a.measurementUnit
        })),
        Categories: wizardState.productData.selectedCategoryIds  // Integer array matching FoodCategory enum
    };
    
    const result = await MerchantService.createProduct(payload);
    
    if (result.success) {
        alert('Product created successfully!');
        productModal.hide();
        loadProducts();
    } else {
        alert(result.message || 'Failed to create product');
    }
}
