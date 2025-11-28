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
        
        // Set up image upload for step 4
        setupImageUpload();
        
    } else if (wizardState.currentStep === 4) {
        // Step 4: Image upload validation
        collectUploadedImages();
        
        // Render main image selection for step 5
        renderMainImageSelection();
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
        
        // Build dropdown options from commonValues
        const optionsHtml = attr.commonValues.map(val => 
            `<option value="${val}">${val}</option>`
        ).join('');
        
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
                    <select class="form-select form-select-sm" 
                        id="attrValue_${index}" disabled>
                        ${optionsHtml}
                    </select>
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

// Set up image upload for Step 4
function setupImageUpload() {
    const fileInput = document.getElementById('productImagesInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    
    // Clear previous selections
    wizardState.productData.uploadedImages = [];
    if (fileInput) fileInput.value = '';
    previewContainer.innerHTML = '';
    
    // Attach change event listener
    fileInput.addEventListener('change', function(e) {
        handleImageSelection(e.target.files);
    });
}

// Handle image selection
function handleImageSelection(files) {
    const maxImages = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (files.length > maxImages) {
        alert(`You can upload maximum ${maxImages} images`);
        return;
    }
    
    wizardState.productData.uploadedImages = [];
    const validFiles = [];
    
    for (let file of files) {
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not an image file`);
            continue;
        }
        if (file.size > maxSize) {
            alert(`${file.name} exceeds 5MB limit`);
            continue;
        }
        validFiles.push(file);
    }
    
    wizardState.productData.uploadedImages = validFiles;
    renderImagePreviews();
}

// Render image previews
function renderImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';
    
    if (wizardState.productData.uploadedImages.length === 0) {
        container.innerHTML = '<p class="text-muted">No images selected</p>';
        return;
    }
    
    wizardState.productData.uploadedImages.forEach((file, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-3 mb-3';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            col.innerHTML = `
                <div class="card">
                    <img src="${e.target.result}" class="card-img-top" style="height: 150px; object-fit: cover;">
                    <div class="card-body p-2">
                        <small class="text-muted">${file.name}</small>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        container.appendChild(col);
    });
}

// Collect uploaded images
function collectUploadedImages() {
    // Images are already collected in wizardState.productData.uploadedImages
    // Just validate that at least one image is uploaded (optional)
    if (wizardState.productData.uploadedImages.length === 0) {
        // Optional: allow proceeding without images
        wizardState.productData.mainImageIndex = -1;
    } else {
        // Set first image as default main image
        wizardState.productData.mainImageIndex = 0;
    }
}

// Render main image selection radio buttons
function renderMainImageSelection() {
    const container = document.getElementById('mainImageOptions');
    const selectionDiv = document.getElementById('mainImageSelection');
    
    container.innerHTML = '';
    
    if (wizardState.productData.uploadedImages.length === 0) {
        selectionDiv.style.display = 'none';
        return;
    }
    
    selectionDiv.style.display = 'block';
    
    wizardState.productData.uploadedImages.forEach((file, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const isChecked = index === wizardState.productData.mainImageIndex ? 'checked' : '';
            col.innerHTML = `
                <div class="card" style="cursor: pointer;" onclick="selectMainImage(${index})">
                    <img src="${e.target.result}" class="card-img-top" style="height: 120px; object-fit: cover;">
                    <div class="card-body p-2 text-center">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="mainImage" id="mainImg${index}" ${isChecked}>
                            <label class="form-check-label" for="mainImg${index}">
                                <small>Main Image</small>
                            </label>
                        </div>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
        
        container.appendChild(col);
    });
}

// Select main image
function selectMainImage(index) {
    wizardState.productData.mainImageIndex = index;
    document.getElementById(`mainImg${index}`).checked = true;
}

// Render review in step 5
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
    
    // Show image count
    const imageCount = wizardState.productData.uploadedImages.length;
    document.getElementById('reviewImages').textContent = imageCount > 0 
        ? `${imageCount} image(s) selected` 
        : 'No images';
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
    
    // Step 1: Create the product
    const result = await MerchantService.createProduct(payload);
    
    if (!result.success) {
        alert(result.message || 'Failed to create product');
        return;
    }
    
    // Get the created product ID from response
    const productId = result.data?.productId;
    
    if (!productId) {
        alert('Product created but ID not returned. Please refresh.');
        productModal.hide();
        loadProducts();
        return;
    }
    
    // Step 2: Upload images if any
    if (wizardState.productData.uploadedImages.length > 0) {
        const imageUploadResult = await uploadProductImages(productId);
        
        if (!imageUploadResult.success) {
            alert('Product created but image upload failed. You can add images later.');
            productModal.hide();
            loadProducts();
            return;
        }
        
        // Step 3: Set main image if images were uploaded
        if (imageUploadResult.photoIds && imageUploadResult.photoIds.length > 0) {
            const mainPhotoId = imageUploadResult.photoIds[wizardState.productData.mainImageIndex];
            await setMainProductImage(mainPhotoId);
        }
    }
    
    alert('Product created successfully!');
    productModal.hide();
    loadProducts();
}

// Upload product images
async function uploadProductImages(productId) {
    const formData = new FormData();
    
    wizardState.productData.uploadedImages.forEach(file => {
        formData.append('Files', file);
    });
    formData.append('ProductId', productId.toString());
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/Photos/add-product-photos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Authentication.getToken()}`
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            // Backend returns PhotoResultDto with array of uploaded photo IDs
            return { success: true, photoIds: data.photoIds || data };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error('Image upload error:', error);
        return { success: false };
    }
}

// Set main product image
async function setMainProductImage(photoId) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/Photos/set-photo-main/${photoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${Authentication.getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Set main image error:', error);
        return false;
    }
}
