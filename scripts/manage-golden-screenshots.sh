#!/bin/bash

# Golden Screenshot Management Script
# Manages baseline screenshots for visual regression testing

set -e

SCREENSHOTS_DIR="e2e/screenshots"
GOLDEN_DIR="$SCREENSHOTS_DIR/golden"
CURRENT_DIR="$SCREENSHOTS_DIR/current"
DIFF_DIR="$SCREENSHOTS_DIR/diff"
PLAYWRIGHT_SCREENSHOTS="test-results"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Create necessary directories
create_directories() {
    print_header "Creating Screenshot Directories"
    
    mkdir -p "$GOLDEN_DIR"
    mkdir -p "$CURRENT_DIR" 
    mkdir -p "$DIFF_DIR"
    mkdir -p "$PLAYWRIGHT_SCREENSHOTS"
    
    print_success "Created directories:
    - $GOLDEN_DIR (baseline screenshots)
    - $CURRENT_DIR (current test screenshots)
    - $DIFF_DIR (difference images)
    - $PLAYWRIGHT_SCREENSHOTS (Playwright test results)"
}

# Update golden screenshots from latest test run
update_golden() {
    print_header "Updating Golden Screenshots"
    
    if [ ! -d "$CURRENT_DIR" ] || [ -z "$(ls -A $CURRENT_DIR 2>/dev/null)" ]; then
        print_error "No current screenshots found. Run tests first."
        exit 1
    fi
    
    # Copy latest screenshots to golden directory
    for screenshot in "$CURRENT_DIR"/*.png; do
        if [ -f "$screenshot" ]; then
            filename=$(basename "$screenshot")
            # Remove timestamp from filename for golden version
            golden_name=$(echo "$filename" | sed 's/-[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]//g')
            golden_path="$GOLDEN_DIR/$golden_name"
            
            cp "$screenshot" "$golden_path"
            print_success "Updated: $golden_name"
        fi
    done
    
    # Also update Playwright's built-in screenshots
    if [ -d "$PLAYWRIGHT_SCREENSHOTS" ]; then
        find "$PLAYWRIGHT_SCREENSHOTS" -name "*.png" -path "*/test-results/*" | while read -r screenshot; do
            if [[ "$screenshot" == *"expected"* ]] || [[ "$screenshot" == *"baseline"* ]]; then
                filename=$(basename "$screenshot")
                cp "$screenshot" "$GOLDEN_DIR/playwright-$filename"
                print_success "Updated Playwright baseline: playwright-$filename"
            fi
        done
    fi
    
    print_success "Golden screenshots updated successfully!"
}

# Compare current screenshots with golden
compare_screenshots() {
    print_header "Comparing Screenshots with Golden Baselines"
    
    if [ ! -d "$GOLDEN_DIR" ] || [ -z "$(ls -A $GOLDEN_DIR 2>/dev/null)" ]; then
        print_error "No golden screenshots found. Run 'update-golden' first."
        exit 1
    fi
    
    if [ ! -d "$CURRENT_DIR" ] || [ -z "$(ls -A $CURRENT_DIR 2>/dev/null)" ]; then
        print_error "No current screenshots found. Run tests first."
        exit 1
    fi
    
    differences_found=0
    
    for golden in "$GOLDEN_DIR"/*.png; do
        if [ -f "$golden" ]; then
            golden_name=$(basename "$golden")
            
            # Find corresponding current screenshot
            current_match=$(find "$CURRENT_DIR" -name "*$golden_name*" | head -1)
            
            if [ -n "$current_match" ] && [ -f "$current_match" ]; then
                # Use ImageMagick compare if available
                if command -v magick >/dev/null 2>&1 || command -v compare >/dev/null 2>&1; then
                    diff_path="$DIFF_DIR/diff-$golden_name"
                    
                    # Use magick compare (ImageMagick 7) or compare (ImageMagick 6)
                    if command -v magick >/dev/null 2>&1; then
                        compare_cmd="magick compare"
                    else
                        compare_cmd="compare"
                    fi
                    
                    if $compare_cmd -metric AE "$golden" "$current_match" "$diff_path" 2>/dev/null; then
                        print_success "✓ $golden_name - No differences"
                    else
                        print_warning "⚠ $golden_name - Differences detected, diff saved to $diff_path"
                        differences_found=$((differences_found + 1))
                    fi
                else
                    print_info "ImageMagick not available, using basic file comparison for $golden_name"
                    if cmp -s "$golden" "$current_match"; then
                        print_success "✓ $golden_name - Files identical"
                    else
                        print_warning "⚠ $golden_name - Files differ"
                        differences_found=$((differences_found + 1))
                    fi
                fi
            else
                print_warning "No current screenshot found for $golden_name"
            fi
        fi
    done
    
    if [ $differences_found -gt 0 ]; then
        print_warning "Found $differences_found differences. Review diff images in $DIFF_DIR"
        return 1
    else
        print_success "All screenshots match golden baselines!"
        return 0
    fi
}

# Clean up old screenshots
cleanup() {
    print_header "Cleaning Up Old Screenshots"
    
    # Keep only the last 5 days of current screenshots
    find "$CURRENT_DIR" -name "*.png" -mtime +5 -delete 2>/dev/null || true
    
    # Clean old diff images
    find "$DIFF_DIR" -name "*.png" -mtime +7 -delete 2>/dev/null || true
    
    # Clean old Playwright test results
    find "$PLAYWRIGHT_SCREENSHOTS" -name "*.png" -mtime +7 -delete 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Show status of screenshots
status() {
    print_header "Screenshot Status"
    
    echo "📂 Directory Status:"
    echo "   Golden: $(ls -1 $GOLDEN_DIR/*.png 2>/dev/null | wc -l) screenshots"
    echo "   Current: $(ls -1 $CURRENT_DIR/*.png 2>/dev/null | wc -l) screenshots" 
    echo "   Diff: $(ls -1 $DIFF_DIR/*.png 2>/dev/null | wc -l) screenshots"
    echo "   Playwright: $(find $PLAYWRIGHT_SCREENSHOTS -name "*.png" 2>/dev/null | wc -l) screenshots"
    echo ""
    
    echo "📸 Recent Golden Screenshots:"
    ls -lt "$GOLDEN_DIR"/*.png 2>/dev/null | head -5 || echo "   No golden screenshots found"
    echo ""
    
    echo "🆕 Recent Current Screenshots:"
    ls -lt "$CURRENT_DIR"/*.png 2>/dev/null | head -5 || echo "   No current screenshots found"
}

# Show help
show_help() {
    echo "Golden Screenshot Management Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  init           Create necessary directories"
    echo "  update-golden  Update golden screenshots from latest test run"
    echo "  compare        Compare current screenshots with golden baselines"
    echo "  cleanup        Clean up old screenshots"
    echo "  status         Show status of screenshot directories"
    echo "  help           Show this help message"
    echo ""
    echo "Workflow:"
    echo "  1. Run tests to generate current screenshots"
    echo "  2. Use 'update-golden' to set new baselines"  
    echo "  3. Use 'compare' to check for visual regressions"
    echo "  4. Use 'cleanup' periodically to manage disk space"
    echo ""
    echo "Examples:"
    echo "  $0 init                    # Set up directories"
    echo "  npm run test:e2e           # Run tests (generates current screenshots)"
    echo "  $0 update-golden           # Set new baselines"
    echo "  npm run test:e2e           # Run tests again"
    echo "  $0 compare                 # Check for differences"
}

# Main command handling
case "${1:-}" in
    "init")
        create_directories
        ;;
    "update-golden")
        create_directories
        update_golden
        ;;
    "compare")
        compare_screenshots
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        print_error "No command specified"
        show_help
        exit 1
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac