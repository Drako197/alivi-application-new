# Form Animation Standards

## Primary Call-to-Action Button Animation Pattern

### Overview
All future forms should implement animated loading states for primary call-to-action buttons to provide clear user feedback during form submission or processing.

### Implementation Pattern

#### 1. Button Structure
```tsx
<button
  type="button"
  onClick={handlePrimaryAction}
  disabled={isSubmitting}
  className="btn-primary"
>
  {isSubmitting ? (
    <>
      <Icon name="loader-2" size={20} className="animate-spin mr-2" />
      Processing...
    </>
  ) : (
    <>
      <Icon name="[action-icon]" size={20} className="text-white mr-2" />
      [Action Text]
    </>
  )}
</button>
```

#### 2. State Management
```tsx
const [isSubmitting, setIsSubmitting] = useState(false)

const handlePrimaryAction = () => {
  setIsSubmitting(true)
  
  // Simulate API call or processing
  setTimeout(() => {
    setIsSubmitting(false)
    // Navigate to next step or show results
  }, 2000)
}
```

### Key Features

1. **Loading State**: Button shows a spinning loader icon (`loader-2`) with `animate-spin` class
2. **Disabled State**: Button is disabled during submission to prevent multiple clicks
3. **Text Change**: Button text changes to indicate current action (e.g., "Verifying...", "Processing...")
4. **Icon Change**: Primary icon is replaced with spinner during loading
5. **Consistent Timing**: 2-second timeout for simulated API calls

### Examples from Patient Eligibility Form

#### Verify Eligibility Button
- **Default State**: Search icon + "Verify Eligibility"
- **Loading State**: Spinning loader + "Verifying..."

#### Reserve Benefits Button
- **Default State**: Shield-check icon + "Reserve Benefits"  
- **Loading State**: Spinning loader + "Reserving Benefits..."

### Special Case: Login Form

The login form uses a custom Lottie animation loader for a more premium feel:

#### Login Button
- **Default State**: "Sign in"
- **Loading State**: Lottie animation + "Signing in..."
- **Component**: `<LottieLoader size="small" className="mr-3" />`

### CSS Classes Used
- `btn-primary`: Primary button styling
- `animate-spin`: Tailwind CSS animation for spinning loader
- `text-white`: White text color for primary buttons
- `mr-2`: Right margin for icon spacing

### Best Practices

1. **Always disable the button** during submission to prevent multiple submissions
2. **Use descriptive loading text** that matches the action being performed
3. **Maintain consistent timing** across all forms (2 seconds for simulated calls)
4. **Include appropriate icons** that represent the action
5. **Provide clear visual feedback** through both icon and text changes

### Implementation Checklist for New Forms

- [ ] Add `isSubmitting` state
- [ ] Create handler function with loading state management
- [ ] Implement button with conditional rendering
- [ ] Add appropriate icons for default and loading states
- [ ] Use consistent timing for simulated API calls
- [ ] Test disabled state prevents multiple submissions
- [ ] Ensure accessibility with proper ARIA labels

### Accessibility Considerations

- The `disabled` attribute prevents keyboard navigation during loading
- Loading text provides clear indication of current state
- Spinning animation provides visual feedback for screen readers
- Consider adding `aria-live` regions for dynamic content updates 